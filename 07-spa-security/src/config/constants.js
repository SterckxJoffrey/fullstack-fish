export const APP_NAME = 'Fishspots';

export const API_KEY = import.meta.env.VITE_API_KEY;

// console.log(import.meta.env)

// console.log(API_KEY)

export const API_URL = 'http://localhost:3001';

export const ROUTES = {
  HOME: '/',
  SPOT_DETAIL: '/spots/:id',
  ADD_SPOT: '/spots/new',
  FAVORITES: '/favorites',
  SEARCH: '/search',
  ABOUT: '/about',
};

export const FISH_TYPES = [
  'Carpe',
  'Brochet',
  'Sandre',
  'Truite',
  'Perche',
  'Silure',
];

export const SPOT_TYPES = [
  'Lac',
  'Rivière',
  'Étang',
  'Canal',
  'Mer',
];