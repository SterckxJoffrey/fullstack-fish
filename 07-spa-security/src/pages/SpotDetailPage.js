export async function SpotDetailPage(params) {
  const { id } = params;

  return `
    <div class="animate-[fadeIn_0.3s_ease]">
      <a href="/" data-link class="inline-block mb-4 text-neutral-400 no-underline hover:text-neutral-600">&larr; Retour à la liste</a>
      <h1>Détail du spot #${id}</h1>
      <p>Contenu à implémenter...</p>
    </div>
  `;
}
