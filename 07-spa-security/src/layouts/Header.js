import { APP_NAME, ROUTES } from '../config/constants.js';

export function Header() {
  return `
    <header class="bg-white py-4 shadow-sm">
      <div class="max-w-[1440px] mx-auto px-4 flex justify-start items-center">
        <a href="${ROUTES.HOME}" data-link class="flex items-center gap-2 mr-10 font-heading text-lg font-bold text-primary-500 no-underline uppercase">
          <span class="flex items-center justify-center size-8 bg-primary-500 rounded-[6px]">
            <svg-icon src="/icons/lucide-Fish-Outlined.svg" width="24" height="24" color="white" />
          </span>
          ${APP_NAME}
        </a>

        <nav class="flex gap-14">
          <a href="${ROUTES.HOME}" data-link class="text-neutral-600 no-underline transition-colors duration-200 hover:text-primary-500">Accueil</a>
          <a href="${ROUTES.ADD_SPOT}" data-link class="text-neutral-600 no-underline transition-colors duration-200 hover:text-primary-500">Ajouter un spot</a>
          <a href="${ROUTES.FAVORITES}" data-link class="text-neutral-600 no-underline transition-colors duration-200 hover:text-primary-500">Mes favoris</a>
          <a href="${ROUTES.ABOUT}" data-link class="text-neutral-600 no-underline transition-colors duration-200 hover:text-primary-500">A propos</a>
        </nav>
      </div>
    </header>
  `;
}
