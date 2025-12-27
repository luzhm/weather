console.log('Weather app started');

window.addEventListener('load', () => {
  const currentLocationSection = document.querySelector('.current-location');
  const addCitySection = document.querySelector('.add-city');

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        currentLocationSection.querySelector('.location-title').textContent = 
          `Текущее местоположение: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
        addCitySection.classList.add('hidden');
      },
      (error) => {
        addCitySection.classList.remove('hidden');
      }
    );
  } else {
    addCitySection.classList.remove('hidden');
  }
});