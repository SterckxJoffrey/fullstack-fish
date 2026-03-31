import { SvgIcon } from './Svg.js';
import DOMPurify from 'dompurify';

export function SpotCard(props) {
  const { id, name, type, fishs = [], image } = props;

  const safeName  = DOMPurify.sanitize(name);
  const safeType  = DOMPurify.sanitize(type);

  const safeImage = image.startsWith('https://') ? image : '';

  return `
    <article class="bg-white rounded-lg overflow-hidden shadow transition-transform duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg" onclick="window.location.href='/spots/${id}'">
      <div class="relative h-[180px] overflow-hidden">
        <img src="${safeImage}" alt="${safeName}" loading="lazy" class="w-full h-full object-cover" />

        <div class="absolute top-2 right-2 size-10 flex items-center justify-center bg-white/70 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors duration-300">
          <svg-icon src="icons/lucide-Heart-Outlined.svg" width="24" height="24" color="var(--color-neutral-600)" hover-color="var(--color-red)" />
        </div>
      </div>

      <div class="p-4 flex flex-col gap-2">
        <h3>${safeName}</h3>

        <div class="flex flex-wrap items-center gap-2 text-neutral-600 text-sm">
          <span class="flex">
            <svg-icon src="icons/lucide-MapPin-Outlined.svg" width="16" height="16" />
          </span>
          <span>${safeType}</span>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-neutral-600 text-sm">
          <span class="flex">
            <svg-icon src="icons/lucide-Fish-Outlined.svg" width="16" height="16" />
          </span>
          <span>${fishs.join(', ')}</span>
        </div>
      </div>
    </article>
  `;
}
