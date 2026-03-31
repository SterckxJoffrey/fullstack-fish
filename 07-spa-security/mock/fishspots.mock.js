export default [
  {
    url: '/api/fishspots',
    method: 'get',
    timeout: 200, 
    response: () => {
    return {
        code: 200,
        data: [
          {
            id: 1,
            name: 'Lac de la Forêt',
            type: 'Lac',
            fishs: ['Carpe', 'Brochet'],
            rating: 4.5,
            image: 'https://picsum.photos/seed/lake1/400/300',
          },
          {
            id: 2,
            name: 'Rivière du Moulin',
            type: 'Rivière',
            fishs: ['Truite', 'Perche'],
            rating: 4.2,
            image: 'https://picsum.photos/seed/river1/400/300',
          },
          {
            id: 3,
            name: 'Étang des Saules',
            type: 'Étang',
            fishs: ['Carpe', 'Sandre'],
            rating: 3.8,
            image: 'https://picsum.photos/seed/pond1/400/300',
          },
          {
            id: 4,
            name: 'Canal Saint-Martin',
            type: 'Canal',
            fishs: ['Perche', 'Silure'],
            rating: 3.5,
            image: 'https://picsum.photos/seed/canal1/400/300',
          },
          {
          id: 5,
          name: '<img src=x onerror="alert(\'XSS : \' + document.cookie)">',
          type: 'Lac',
          fishs: ['Carpe'],
          rating: 5,
          image: 'https://picsum.photos/seed/xss/400/300',
        },
        ],
      }
    },
  }
]