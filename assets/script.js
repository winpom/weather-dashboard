const userFormEl = document.querySelector('#user-form');
const cityInputEl = document.querySelector('#city');
const cityButtonsEl = document.querySelector('#city-buttons');
const forecastContainerEl = document.querySelector('#forecast-container');
const citySearchEl = document.querySelector('#city-search-term');
const searchHistoryEl = document.querySelector('#search-history');

let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

const renderSearchHistory = () => {
    searchHistoryEl.innerHTML = ''; // Clear previous content
    searchHistory.forEach(city => {
        const historyItem = document.createElement('div');
        historyItem.textContent = city;
        historyItem.classList.add("card-body");
        searchHistoryEl.appendChild(historyItem);
    });
};

// Render search history initially
renderSearchHistory();

// Hide the weather section initially
document.getElementById('weather-section').style.display = 'none';

// Show the weather section when the user searches for a city
const showWeatherSection = function () {
    document.getElementById('weather-section').style.display = 'block';
};

// Launches the city search function based on user input
const formSubmitHandler = function (event) {
    event.preventDefault();

    const city = cityInputEl.value.trim();

    if (city) {
        getCityForecast(city);

        forecastContainerEl.innerHTML = '';
        cityInputEl.value = '';
        searchHistory.push(city);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    } else {
        alert('Please enter a City Name');
    }

};

// Launches the city search function based on the city button pressed
const buttonClickHandler = function (event) {
    const city = event.target.getAttribute('city');
    if (city) {
        getCityForecast(city);
        forecastContainerEl.innerHTML = '';
        searchHistory.push(city);
        localStorage.setItem("search", JSON.stringify(searchHistory));
        renderSearchHistory();
    }
};

// Function that pulls in the weather data from the API using the city inputted by the buttonClickHandler or formSubmitHandler functions
const getCityForecast = function (city) {
    const weatherAppAPIKey = "afdd48f219a0ca8e18ed477c2d0cee05";
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${weatherAppAPIKey}`;

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok)
                return response.json();
            else {
                alert(`Error:${response.statusText}`);
            }
        }).then(function (data) {
            console.log("--------- First request with geolocation --------")
            console.log(data);

            const latitude = data[0].lat;
            const longitude = data[0].lon;
            console.log(latitude, longitude);

            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${weatherAppAPIKey}`
            fetch(forecastUrl).then(function (response2) {
                return response2.json();
            }).then(function (data2) {
                console.log("--------- Second request with forecast --------")
                console.log(data2);
                displayWeather(data2.list, city);
            })
        })
        .catch(function (error) {
            alert('Unable to connect to Weather API');
        });
};

// Renders a card onsite showing the weather information for today
const createTodayWeatherCard = function (today) {
    const todayWeatherCard = document.createElement('div');
    todayWeatherCard.classList.add('card', 'today-weather-card');

    const todayDate = new Date(today.dt_txt.split(' ')[0]).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const todayCardHeader = document.createElement('h1');
    todayCardHeader.classList.add("card-header", "h1");
    todayCardHeader.innerHTML = `Today,<br>${todayDate}`;

    const todayCardBody = document.createElement('div');
    todayCardBody.classList.add("card-body");

    const todayCardIcon = document.createElement('p');
    todayCardIcon.classList.add("card-text");
    todayCardIcon.textContent = `Weather: ${getWeatherIcon(today.weather[0].main)}`;

    const todayCardTemp = document.createElement('p');
    todayCardTemp.classList.add("card-text");
    todayCardTemp.textContent = `Temperature: ${today.main.temp}°F`;

    const todayCardWind = document.createElement('p');
    todayCardWind.classList.add("card-text");
    todayCardWind.textContent = `Wind: ${today.wind.speed} mph`;

    const todayCardHum = document.createElement('p');
    todayCardHum.classList.add("card-text");
    todayCardHum.textContent = `Humidity: ${today.main.humidity}%`;

    todayCardBody.append(todayCardIcon, todayCardTemp, todayCardWind, todayCardHum);
    todayWeatherCard.append(todayCardHeader, todayCardBody);

    return todayWeatherCard;
};

// Renders a card onsite showing the weather forecast for the next four-five
const createForecastCard = function (forecast) {
    const dateParts = forecast.dt_txt.split(' ')[0];
    // Convert the date string to a human-readable format
    const date = new Date(dateParts).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    const forecastCard = document.createElement('div');
    forecastCard.classList.add("card", "w-75", "task-card", "my-3");

    const cardHeader = document.createElement('div');
    cardHeader.classList.add("card-header", "h4");
    cardHeader.textContent = date;

    const cardBody = document.createElement('div');
    cardBody.classList.add("card-body");

    const cardIcon = document.createElement('p');
    cardIcon.classList.add("card-text");
    cardIcon.textContent = `Weather: ${getWeatherIcon(forecast.weather[0].main)}`;

    const cardTemp = document.createElement('p');
    cardTemp.classList.add("card-text");
    cardTemp.textContent = `Temperature: ${forecast.main.temp}°F`;

    const cardWind = document.createElement('p');
    cardWind.classList.add("card-text");
    cardWind.textContent = `Wind: ${forecast.wind.speed} mph`;

    const cardHum = document.createElement('p');
    cardHum.classList.add("card-text");
    cardHum.textContent = `Humidity: ${forecast.main.humidity}%`;

    cardBody.append(cardIcon, cardTemp, cardWind, cardHum);
    forecastCard.append(cardHeader, cardBody);

    return forecastCard;
};

// Function to get weather icon or emoji based on weather condition
const getWeatherIcon = function (weatherCondition) {
    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            return '☀️';
        case 'clouds':
            return '☁️';
        case 'rain':
            return '🌧️';
        case 'snow':
            return '❄️';
        case 'thunderstorm':
            return '⛈️';
        default:
            return '';
    }
};

// This function adds the weather cards to the site
const displayWeather = function (forecast, searchTerm) {
    if (forecast.length === 0) {
        forecastContainerEl.textContent = 'No forecast found.';
        return;
    }

    citySearchEl.textContent = searchTerm;

    // Display today's weather at the top
    const todayWeather = forecast[0]; // Assuming the first item in the forecast array represents today's weather
    const todayWeatherCard = createTodayWeatherCard(todayWeather);
    document.getElementById('today-weather').innerHTML = ''; // Clear previous content
    document.getElementById('today-weather').appendChild(todayWeatherCard);

    // Display the forecast for the next 5 days in a single row of separate cards
    const forecastRowContainer = document.createElement('div');
    forecastRowContainer.classList.add('forecast-row');

    for (let i = 8; i < 40; i += 8) {
        const forecastCard = createForecastCard(forecast[i]);
        forecastRowContainer.appendChild(forecastCard);
    }

    forecastContainerEl.innerHTML = ''; // Clear previous content
    forecastContainerEl.appendChild(forecastRowContainer);

    showWeatherSection();
};

// Event listeners to trigger the above functions
userFormEl.addEventListener('submit', formSubmitHandler);
cityButtonsEl.addEventListener('click', buttonClickHandler);