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

const STORAGE_KEYS = {
  CURRENT_LOCATION: 'weatherApp.currentLocation',
  CITIES: 'weatherApp.cities'
};

async function loadCityList() {
  try {
    const res = await fetch('russian-cities.json');
    if (!res.ok) throw new Error('Не удалось загрузить список городов');
    cityList = await res.json();
  } catch (error) {
    console.error(error);
    cityList = [];
  }
}

function updateCitySuggestions() {
  const val = cityInput.value.trim().toLowerCase();
  while (citySuggestions.firstChild) {
  citySuggestions.removeChild(citySuggestions.firstChild);
  }


  if (val.length < 2) return;

  const filtered = cityList
    .filter(city => city.name.toLowerCase().startsWith(val))
    .slice(0, 5);

  filtered.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city.name;
    li.dataset.lat = city.coords.lat;
    li.dataset.lon = city.coords.lon;
    citySuggestions.appendChild(li);
  });
}

citySuggestions.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'li') {
    cityInput.value = e.target.textContent;
    cityInput.dataset.lat = e.target.dataset.lat;
    cityInput.dataset.lon = e.target.dataset.lon;
    while (citySuggestions.firstChild) {
  citySuggestions.removeChild(citySuggestions.firstChild);
    }

    inputError.style.display = 'none';
  }
});

cityInput.addEventListener('input', () => {
  cityInput.dataset.lat = '';
  cityInput.dataset.lon = '';
  updateCitySuggestions();
  inputError.style.display = 'none';
});

function saveCitiesToStorage() {
  const cities = Array.from(citiesList.children).map(li => ({
    name: li.querySelector('.city-name').textContent,
    lat: li.dataset.lat,
    lon: li.dataset.lon
  }));
  localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
}

function loadCitiesFromStorage() {
  const data = localStorage.getItem(STORAGE_KEYS.CITIES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveCurrentLocation(coords) {
  if (coords) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify(coords));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_LOCATION);
  }
}

function loadCurrentLocation() {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
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

function displayForecast(data, isCurrentLocation = false, cityName = null) {
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

  locationTitle.textContent = cityName ? cityName : (isCurrentLocation ? 'Текущее местоположение' : data.city.name);
}

async function fetchWeather(lat, lon, isCurrentLocation = false, cityName = null) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${API_KEY}`;

  try {
    showLoading();
    hideError();

    const res = await fetch(url);
    if (!res.ok) throw new Error('Ошибка сети');

    const data = await res.json();

    hideLoading();
    displayForecast(data, isCurrentLocation, cityName);
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
        const { latitude, longitude } = position.coords;
        saveCurrentLocation({ lat: latitude, lon: longitude });
        fetchWeather(latitude, longitude, true);
        addCitySection.classList.remove('hidden');
      },
      (error) => {
        saveCurrentLocation(null);
        addCitySection.classList.remove('hidden');
      }
    );
  } else {
    saveCurrentLocation(null);
    addCitySection.classList.remove('hidden');
  }
}

function restoreCities() {
  const savedCities = loadCitiesFromStorage();
  savedCities.forEach(city => {
    const li = document.createElement('li');
    li.dataset.lat = city.lat;
    li.dataset.lon = city.lon;

    const citySpan = document.createElement('span');
    citySpan.textContent = city.name;
    citySpan.classList.add('city-name');
    li.appendChild(citySpan);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.classList.add('remove-btn');
    removeBtn.title = 'Удалить город';
    li.appendChild(removeBtn);

    citiesList.appendChild(li);
  });
}

window.addEventListener('load', async () => {
  await loadCityList();

  restoreCities();

  const savedCurrentLocation = loadCurrentLocation();

  if (savedCurrentLocation) {
    fetchWeather(savedCurrentLocation.lat, savedCurrentLocation.lon, true);
    addCitySection.classList.remove('hidden');
  } else {
    requestGeolocation();
  }
});

addCityBtn.addEventListener('click', () => {
  const cityName = cityInput.value.trim();

  if (cityName === '') {
    inputError.style.display = 'block';
    inputError.textContent = 'Введите название города';
    return;
  }

  const matchedCity = cityList.find(city => city.name.toLowerCase() === cityName.toLowerCase());

  if (!matchedCity) {
    inputError.style.display = 'block';
    inputError.textContent = 'Такой город не найден';
    return;
  }

  const existingCities = Array.from(citiesList.children).map(
    li => li.querySelector('.city-name').textContent.toLowerCase()
  );

  if (existingCities.includes(cityName.toLowerCase())) {
    inputError.style.display = 'block';
    inputError.textContent = 'Этот город уже добавлен';
    return;
  }

  inputError.style.display = 'none';

  const li = document.createElement('li');
  li.dataset.lat = matchedCity.coords.lat;
  li.dataset.lon = matchedCity.coords.lon;

  const citySpan = document.createElement('span');
  citySpan.textContent = matchedCity.name;
  citySpan.classList.add('city-name');
  li.appendChild(citySpan);

  const removeBtn = document.createElement('button');
  removeBtn.textContent = '×';
  removeBtn.classList.add('remove-btn');
  removeBtn.title = 'Удалить город';
  li.appendChild(removeBtn);

  citiesList.appendChild(li);

  saveCitiesToStorage();

    cityInput.value = '';
    citySuggestions.replaceChildren();
});

citiesList.addEventListener('click', (e) => {
  if (e.target.classList.contains('remove-btn')) {
    const li = e.target.parentElement;
    li.remove();
    saveCitiesToStorage();
    return;
  }

  if (e.target.tagName.toLowerCase() === 'li' || e.target.classList.contains('city-name')) {
    const li = e.target.tagName.toLowerCase() === 'li' ? e.target : e.target.parentElement;
    const lat = li.dataset.lat;
    const lon = li.dataset.lon;
    const cityName = li.querySelector('.city-name').textContent;

    if (lat && lon) {
      fetchWeather(lat, lon, false, cityName);
      addCitySection.classList.remove('hidden');
      saveCurrentLocation(null);
    }
  }
});

refreshBtn.addEventListener('click', () => {
  const savedCurrentLocation = loadCurrentLocation();

  if (savedCurrentLocation) {
    fetchWeather(savedCurrentLocation.lat, savedCurrentLocation.lon);
  }
  Array.from(citiesList.children).forEach(li => {
    const lat = li.dataset.lat;
    const lon = li.dataset.lon;
    if (lat && lon) {
      fetchWeather(lat, lon);
    }
  });
});