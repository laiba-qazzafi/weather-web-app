// Define global variables
const apiKey = "b190a0605344cc4f3af08d0dd473dd25"; // Replace with your API key
const wrapper = document.querySelector(".wrapper");
const wrapper2 = document.querySelector(".wrapper2");
const inputPart = document.querySelector(".input-part");
const infoTxt = inputPart.querySelector(".info-txt");
const inputField = inputPart.querySelector("input");
const locationBtn = inputPart.querySelector("button");
const weatherPart = wrapper.querySelector(".weather-part");
const forecastPart = wrapper.querySelector(".forecast-part");
const wIcon = weatherPart.querySelector("img");
// const fIcon = forecastPart.querySelector("img");
const arrowBack = wrapper.querySelector("header i");

// Event listeners
inputField.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && inputField.value.trim() !== "") {
    requestApi(inputField.value.trim());
    requestForecast(inputField.value.trim());

  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert("Your browser does not support geolocation.");
  }
});

// Request weather data by city name
function requestApi(city) {
  const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
  fetchData(api, displayWeather);
}

// Request forecast data by city name
function requestForecast(city) {
  const api = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
  fetchData(api, displayForecast);
}

// Geolocation success callback
function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  const weatherApi = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
  const forecastApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
  fetchData(weatherApi, displayWeather);
  fetchData(forecastApi, displayForecast);
}

// Geolocation error callback
function onError(error) {
  infoTxt.innerText = error.message;
  infoTxt.classList.add("error");
}

// Fetch data from API
function fetchData(api, callback) {
  infoTxt.innerText = "Fetching data...";
  infoTxt.classList.add("pending");

  fetch(api)
    .then((res) => res.json())
    .then((data) => {callback(data)
    console.log(data)})
    .catch((error) => {
      infoTxt.innerText = "Something went wrong";
      infoTxt.classList.replace("pending", "error");
      console.log("Error fetching data:", error);
    });
}

// Display weather data
function displayWeather(info) {
  if (info.cod == "404") {
    // if user entered city name isn't valid
    infoTxt.classList.replace("pending", "error");
    infoTxt.innerText = `${inputField.value} isn't a valid city name`;
  } else {
    //getting required properties value from the whole weather information
    const city = info.name;
    const country = info.sys.country;
    const { description, id } = info.weather[0];
    const { temp, feels_like, humidity } = info.main;

    // using custom weather icon according to the id which api gives to us
    if (id == 800) {
      wIcon.src = "icons/clear.svg";
    } else if (id >= 200 && id <= 232) {
      wIcon.src = "icons/storm.svg";
    } else if (id >= 600 && id <= 622) {
      wIcon.src = "icons/snow.svg";
    } else if (id >= 701 && id <= 781) {
      wIcon.src = "icons/haze.svg";
    } else if (id >= 801 && id <= 804) {
      wIcon.src = "icons/cloud.svg";
    } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
      wIcon.src = "icons/rain.svg";
    }


    //passing a particular weather info to a particular element
    weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
    weatherPart.querySelector(".weather").innerText = description;
    weatherPart.querySelector(
      ".location span"
    ).innerText = `${city}, ${country}`;
    weatherPart.querySelector(".temp .numb-2").innerText =
      Math.floor(feels_like);
    weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
    infoTxt.classList.remove("pending", "error");
    infoTxt.innerText = "";
    inputField.value = "";
    wrapper.classList.add("active");
    // Set the background image for the body
    document.body.style.backgroundImage = "url('https://source.unsplash.com/1600x900/?" + city + "')"
    
    // document.body.style.backgroundImage = `url('${weatherBgUrl}')`;
  }
}

arrowBack.addEventListener("click", () => {
  wrapper.classList.remove("active");
});


function displayForecast(forecastData) {
  console.log("Forecast data:", forecastData);

  const forecastPart = document.querySelector(".forecast-part");
  const locationSpan = forecastPart.querySelector(".location .city-country");
  const forecastItemsContainer = forecastPart.querySelector(".forecast-items-container");

  if (forecastData.cod == "404") {
    // If the forecast data is not found or invalid
    locationSpan.innerText = ""; // Clear location information
    forecastItemsContainer.innerHTML = '<p class="error-message">Forecast data not available</p>'; // Display error message
  } else {
    // Valid forecast data found
    const city = forecastData.city.name;
    const country = forecastData.city.country;

    console.log(city);
    console.log(country);

    const forecastDetails = forecastData.list;

    locationSpan.innerText = `${city}, ${country}`;

    // Clear previous forecast items if any
    forecastItemsContainer.innerHTML = "";

    // Loop through forecast details and create HTML elements to display them
    forecastDetails.forEach((forecast) => {
      const forecastItem = document.createElement("div");
      forecastItem.classList.add("forecast-item");

    const date = new Date(forecast.dt * 1000); // Convert timestamp to date
    const dateStr = date.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

      const weatherDesc = forecast.weather[0].description;
      const temp = forecast.main.temp;
      const humidity = forecast.main.humidity;

      forecastItem.innerHTML = `
        <p class="date">${dateStr}</p>
        <img src="" alt="Weather Icon" class="weather-icon" />
        <p class="temperature">${temp} °C</p>
        <p class="description">${weatherDesc}</p>
        <p class="humidity">Humidity: ${humidity}%</p>
      `;

      const weatherIcon = forecastItem.querySelector(".weather-icon");
      setWeatherIcon(weatherIcon, forecast.weather[0].id);

      forecastItemsContainer.appendChild(forecastItem);
    });

    wrapper2.classList.add("active");

    // Remove any error message if present
    const errorMessage = forecastItemsContainer.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }
}

function setWeatherIcon(element, weatherId) {
  let iconSrc = "";
  if (weatherId == 800) {
    iconSrc = "icons/clear.svg";
  } else if (weatherId >= 200 && weatherId <= 232) {
    iconSrc = "icons/storm.svg";
  } else if (weatherId >= 600 && weatherId <= 622) {
    iconSrc = "icons/snow.svg";
  } else if (weatherId >= 701 && weatherId <= 781) {
    iconSrc = "icons/haze.svg";
  } else if (weatherId >= 801 && weatherId <= 804) {
    iconSrc = "icons/cloud.svg";
  } else if ((weatherId >= 500 && weatherId <= 531) || (weatherId >= 300 && weatherId <= 321)) {
    iconSrc = "icons/rain.svg";
  }
  element.src = iconSrc;
}


// Additional functions (changeTheme, getTheme, saveTheme) remain unchanged

// Initialize theme from local storage

//change color theme
//get the theme from local storage
getTheme();

//color palette
const colors = [
  "hsl(345, 80%, 50%)",
  "hsl(100, 80%, 50%)",
  "hsl(200, 80%, 50%)",
  "hsl(227, 66%, 55%)",
  "hsl(26, 80%, 50%)",
  "hsl(44, 90%, 51%)",
  "hsl(280, 100%, 65%)",
  "hsl(480, 100%, 25%)",
  "hsl(180, 100%, 25%)",
];

const colorBtns = document.querySelectorAll(".theme-color");
const darkModeBtn = document.querySelector(".dark-mode-btn");

//change theme to dark
var isDark = false;
darkModeBtn.addEventListener("click", () => {
  if(!isDark) {
    changeTheme("#000");
    isDark = true;
  }else{
    changeTheme(colors[3]);
    isDark = false;
  }
});

//loop through colors array and set each color to a button
for (let i = 0; i < colorBtns.length; i++) {
  colorBtns[i].style.backgroundColor = colors[i];
}

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    changeTheme(btn.style.backgroundColor);
  });
});

function changeTheme(color) {
  document.documentElement.style.setProperty("--primary-color", color);
  saveTheme(color);
}

//get the theme from local storage
function getTheme() {
  const theme = localStorage.getItem("theme");
  if (theme) {
    changeTheme(theme);
  }
}

//save the theme to local storage
function saveTheme(color) {
  localStorage.setItem("theme", color);
}

