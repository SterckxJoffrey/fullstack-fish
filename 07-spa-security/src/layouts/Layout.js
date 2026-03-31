import { Header } from './Header.js';
import { Footer } from './Footer.js';
import { Main } from './Main.js';

export function Layout(props = {}) {
  const { content = '' } = props;

  return `
    <div class="min-h-screen flex flex-col font-body">
      ${Header()}
      ${Main({ content })}
      ${Footer()}
    </div>
  `;
}
