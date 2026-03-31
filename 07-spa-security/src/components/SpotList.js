import { SpotCard } from './SpotCard.js';

export function SpotList(props) {
  const { spots = [] } = props;

  if (spots.length === 0) {
    return `
      <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-6">
        <p>Aucun spot trouvé.</p>
      </div>
    `;
  }

  return `
    <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mt-6">
      ${spots.map(spot => SpotCard(spot)).join('')}
    </div>
  `;
}
