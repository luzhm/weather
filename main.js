console.log('Weather app started');

const API_KEY = '5bbbf07ebb61de29f1e297dac0a44c9f';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const currentLocationSection = document.querySelector('.current-location');
const addCitySection = document.querySelector('.add-city');
const forecastDays = document.querySelectorAll('.forecast-day');
const loadingStatus = currentLocationSection.querySelector('.status-loading');
const errorStatus = currentLocationSection.querySelector('.status-error');
const locationTitle = currentLocationSection.querySelector('.location-title');
const refreshBtn = document.querySelector('.refresh-btn');

function showLoading() {
  loadingStatus.style.display = 'block';
  errorStatus.style.display = 'none';
}

function hideLoading() {
  loadingStatus.style.display = 'none';
}

function showError(message) {
  errorStatus.textContent = message;
  errorStatus.style.display = 'block';
}

function hideError() {
  errorStatus.style.display = 'none';
}

function displayForecast(data) {
  const daysMap = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!daysMap[date]) {
      daysMap[date] = [];
    }
    daysMap[date].push(item);
  });

  const dates = Object.keys(daysMap).slice(0, 3);

  dates.forEach((date, idx) => {
    const temps = daysMap[date].map(i => i.main.temp);
    const avgTemp = temps.reduce((a,b) => a + b, 0) / temps.length;

    let label = '';
    if (idx === 0) label = 'Сегодня';
    else if (idx === 1) label = 'Завтра';
    else label = 'Послезавтра';

    if (forecastDays[idx]) {
      forecastDays[idx].querySelector('.forecast-date').textContent = label;
      forecastDays[idx].querySelector('.forecast-temp').textContent = `${avgTemp.toFixed(1)} °C`;
    }
  });

  locationTitle.textContent = data.city.name;
}

async function fetchWeather(lat, lon) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${API_KEY}`;

  try {
    showLoading();
    hideError();

    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка сети');

    const data = await res.json();

    hideLoading();
    displayForecast(data);
  } catch (error) {
    hideLoading();
    showError('Не удалось получить данные о погоде');
    console.error(error);
  }
}

function requestGeolocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        addCitySection.classList.add('hidden');
        const { latitude, longitude } = position.coords;
        fetchWeather(latitude, longitude);
      },
      (error) => {
        console.log('Доступ к геолокации отклонён или произошла ошибка:', error.message);
        addCitySection.classList.remove('hidden');
      }
    );
  } else {
    console.log('Геолокация не поддерживается браузером');
    addCitySection.classList.remove('hidden');
  }
}

window.addEventListener('load', () => {
  requestGeolocation();
});

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    requestGeolocation();
  });
}