console.log('Weather app started');
window.addEventListener('load', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Координаты:', position.coords.latitude, position.coords.longitude);
          const currentLocationSection = document.querySelector('.current-location');

navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    console.log('Координаты:', latitude, longitude);


    currentLocationSection.querySelector('.location-title').textContent = 
      `Текущее местоположение: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
  },

);

      },
      (error) => {
        console.log('Доступ к геолокации отклонён или произошла ошибка:', error.message);
      }
    );
  } else {
    console.log('Геолокация не поддерживается браузером');
  }
});
