import { APP_NAME } from '../config/constants.js';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="bg-neutral-200 text-neutral-600 py-6 mt-auto">
      <div class="max-w-[1440px] mx-auto px-4 flex justify-center items-center">
        <p>&copy; ${currentYear} ${APP_NAME} - Tous droits réservés</p>
      </div>
    </footer>
  `;
}
