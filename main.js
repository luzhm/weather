console.log('Weather app started');
window.addEventListener('load', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Координаты:', position.coords.latitude, position.coords.longitude);
          
      },
      (error) => {
        console.log('Доступ к геолокации отклонён или произошла ошибка:', error.message);
      }
    );
  } else {
    console.log('Геолокация не поддерживается браузером');
  }
});
