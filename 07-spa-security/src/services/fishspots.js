export function getMockSpots() {
  return fetch('/api/fishspots')
    .then(response => response.json())
    .then(data => {
      return data.data;
    })
    .catch(error => {
      console.error('Error fetching fishspots:', error);
    })
}