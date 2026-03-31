export function getSpots() {
  return fetch('http://localhost:3000/fishspots')
    .then(response => response.json())
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('Error fetching fishspots:', error);
    })
}