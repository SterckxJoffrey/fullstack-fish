import './components/Svg.js';

import { router } from './router/Router.js';
import { ROUTES } from './config/constants.js';

import { HomePage } from './pages/HomePage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { SpotDetailPage } from './pages/SpotDetailPage.js';
import { AddSpotPage } from './pages/AddSpotPage.js';

router
  .addRoute(ROUTES.HOME, HomePage)
  .addRoute(ROUTES.SPOT_DETAIL, SpotDetailPage)
  .addRoute(ROUTES.ADD_SPOT, AddSpotPage)
  .setNotFound(NotFoundPage);

document.addEventListener('DOMContentLoaded', () => {
  router.start();
});
