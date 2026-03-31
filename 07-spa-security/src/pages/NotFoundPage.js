export async function NotFoundPage() {
  return `
    <div class="animate-[fadeIn_0.3s_ease] text-center py-16 px-4">
      <h1 class="text-[7rem] text-neutral-400">404</h1>
      <p>Oups ! Cette page n'existe pas.</p>
      <a href="/" data-link class="inline-block rounded-[10px] border-0 font-normal text-center no-underline cursor-pointer bg-primary-500 text-white px-6 py-3 text-[0.85rem]">Retour à l'accueil</a>
    </div>
  `;
}
