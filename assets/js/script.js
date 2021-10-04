let APIKey = "b929c0e3026118ea0292882110d701a8";
let citySearch = $("#citySearch");
let cityButtonSearch = $("#cityButtonSearch");
let geoArounMeButton = $("#geoArounMeButton");

// On click or enter button assigns city 
cityButtonSearch.on("click", inputCity);
citySearch.on("keyup", function(event) {
    if (event.keyCode === 13) {
     event.preventDefault();
     inputCity();
    }
});

function inputCity(){
    let city = citySearch.val();
        if (city === "") {
            console.log('Error Enter city name')
            return;
        }
    let queryURLCity = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey;
    citySearch.val("");
    fetchWeather(queryURLCity);
}

function fetchWeather(queryURLCity) {
    fetch(queryURLCity)
    .then(function (response) {
         return response.json();
    })
    .then(function (data) {
        console.log(data)
    })
}

geoArounMeButton.on("click", getLocation);

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position){
        console.log("Latitude: ",position.coords.latitude);
        console.log("Longitude: ",position.coords.longitude);
        });
      } else { 
    console.log("Geolocation is not supported by this browser.");
  }
}
