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

const cityInput = document.querySelector('.city-input');
const addCityBtn = document.querySelector('.add-city-btn');
const inputError = document.querySelector('.input-error');
const citiesList = document.querySelector('.cities');
const citySuggestions = document.querySelector('.city-suggestions');

let cityList = [];
let selectedCity = null;

async function loadCityList() {
  try {
    const response = await fetch('russian-cities.json');
    cityList = await response.json();
  } catch (error) {
    console.error('Ошибка загрузки списка городов:', error);
  }
}

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

cityInput.addEventListener('input', () => {
  const query = cityInput.value.trim().toLowerCase();
  citySuggestions.innerHTML = '';
  selectedCity = null;

  if (query.length < 2) {
    citySuggestions.style.display = 'none';
    return;
  }

  const matchedCities = cityList.filter(city =>
    city.name.toLowerCase().startsWith(query)
  );

  if (matchedCities.length === 0) {
    citySuggestions.style.display = 'none';
    return;
  }

  matchedCities.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city.name;
    citySuggestions.appendChild(li);
  });

  citySuggestions.style.display = 'block';
});

citySuggestions.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'li') {
    const cityName = e.target.textContent;
    cityInput.value = cityName;
    citySuggestions.innerHTML = '';
    citySuggestions.style.display = 'none';

    selectedCity = cityList.find(city => city.name === cityName);
    inputError.style.display = 'none';
  }
});

addCityBtn.addEventListener('click', () => {
  if (!selectedCity) {
    inputError.style.display = 'block';
    inputError.textContent = 'Пожалуйста, выберите город из списка';
    return;
  }

  const cityName = selectedCity.name;

  const existingCities = Array.from(citiesList.children).map(
    li => li.textContent.toLowerCase()
  );

  if (existingCities.includes(cityName.toLowerCase())) {
    inputError.style.display = 'block';
    inputError.textContent = 'Этот город уже добавлен';
    return;
  }

  if (citiesList.children.length >= 3) {
    inputError.style.display = 'block';
    inputError.textContent = 'Можно добавить не более 3 городов';
    return;
  }

  inputError.style.display = 'none';

  const li = document.createElement('li');
  li.textContent = cityName;
  li.dataset.lat = selectedCity.coords.lat;
  li.dataset.lon = selectedCity.coords.lon;
  citiesList.appendChild(li);

  cityInput.value = '';
  selectedCity = null;
});

citiesList.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'li') {
    const lat = e.target.dataset.lat;
    const lon = e.target.dataset.lon;

    if (lat && lon) {
      fetchWeather(lat, lon);
      addCitySection.classList.add('hidden');
    }
  }
});

if (refreshBtn) {
  refreshBtn.addEventListener('click', () => {
    requestGeolocation();
  });
}

window.addEventListener('load', async () => {
  await loadCityList();
  requestGeolocation();
});
