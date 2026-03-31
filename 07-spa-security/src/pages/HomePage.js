import { SpotList } from '../components/SpotList.js';
import { getMockSpots } from '../services/fishspots.js';
import { Button } from '../components/Button.js';

export async function HomePage() {
  try {
    const spots = await getMockSpots();

    return `
      <div class="animate-[fadeIn_0.3s_ease]">
        <section class="relative min-h-[280px] mb-8 py-12 px-4 bg-[url('/images/bg-hero.png')] bg-cover bg-center bg-no-repeat rounded-lg shadow-xs text-center">
          <div class="relative z-2 max-w-[680px] mx-auto text-neutral-600 flex flex-col items-center justify-center gap-4">
            <h1 class="text-neutral-900 mb-0">Trouvez votre spot de rêve</h1>
            <p>Découvrez des milliers de lieux de pêche partagés par des passionnés comme vous. Que vous cherchiez la truite en rivière ou la carpe en étang, Fishspots a ce qu'il vous faut.</p>
            ${Button({ text: 'Explorer tous les spots', variant: 'primary', size: 'md' })}
          </div>
          <div class="absolute top-0 left-0 w-full h-full bg-white/50 z-1"></div>
        </section>
  
        <section>
          <h2>Découvrez les meilleurs spots</h2>
          ${SpotList({ spots: spots })}
        </section>
      </div>
    `;
  } catch (error) {
    console.error('Error fetching fishspots:', error);
  }
}
