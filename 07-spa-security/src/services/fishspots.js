export function getSpots() {
  return fetch('https://fullstack-fish-api.onrender.com/fishspots')
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error fetching fishspots:', error);
    })
}