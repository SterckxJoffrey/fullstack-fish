import { Layout } from '../layouts/Layout.js';

class Router {
  constructor() {
    this.routes = {};

    this.notFoundHandler = () => '<h1>404 - Page non trouvée</h1>';

    window.addEventListener('popstate', () => {
      this.handleRoute(window.location.pathname);
    });
  }

  /**
   * Register a route
   * 
   * @param {string} path - The path of the route (ex: '/spots/:id')
   * @param {Function} handler - The function that returns the HTML of the page
   */
  addRoute(path, handler) {
    this.routes[path] = handler;

    return this; // Allow chaining
  }

  /**
   * Set the handler for the not found page
   * 
   * @param {Function} handler - The function that returns the HTML of the not found page
   */
  setNotFound(handler) {
    this.notFoundHandler = handler;

    return this;
  }

  /**
   * Navigate to a URL
   * 
   * @param {string} path - The path to navigate to
   */
  navigate(path) {
    // Add the entry in the history
    window.history.pushState({}, '', path);
    // Handle the route
    this.handleRoute(path);
  }

  /**
   * Handle the display of the current route
   * 
   * @param {string} path - The path to display
   */
  handleRoute(path) {
    if (path.lastIndexOf('icons')!== -1) {
      console.log('icons detected', path);
      return;
    }

    // First check for an exact match
    if (this.routes[path]) {
      this.render(this.routes[path]());
      return;
    }

    // Then check for a route with parameters (ex: /spots/:id)
    for (const route in this.routes) {
      const params = this.#matchRoute(route, path);

      if (params) {
        this.render(this.routes[route](params));
        return;
      }
    }

    // No route found
    this.render(this.notFoundHandler());
  }

  /**
   * Compare a route pattern with a real path
   * 
   * @param {string} routePattern - The pattern (ex: '/spots/:id')
   * @param {string} path - The real path (ex: '/spots/42')
   * @returns {Object|null} - The extracted parameters or null
   */
  #matchRoute(routePattern, path) {
    // Convert the pattern to a regex
    // /spots/:id becomes /spots/([^/]+)
    const paramNames = [];
    const regexPattern = routePattern.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    const regex = new RegExp(`^${regexPattern}$`);
    const match = path.match(regex);

    if (!match) return null;

    // Extract the values of the parameters
    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = match[index + 1];
    });

    return params;
  }

  /**
   * Display the content in the main container
   * 
   * @param {string} html - The HTML to display
   */
  render(html) {
    if (!(html instanceof Promise)) {
      throw new Error('HTML must be a promise');
    }

    const app = document.getElementById('app');
    
    if (app) {
      html
        .then(html => {
          app.innerHTML = Layout({ content: html });
        });
    }
  }

  /**
   * Start the router on the current route
   */
  start() {
    // Intercept clicks on links
    document.addEventListener('click', (e) => {
      // Check if it's an internal link
      if (e.target.matches('[data-link]')) {
        e.preventDefault();

        this.navigate(e.target.getAttribute('href'));
      }
    });

    // Handle the initial route
    this.handleRoute(window.location.pathname);
  }
}

// Export a unique instance (Singleton)
export const router = new Router();