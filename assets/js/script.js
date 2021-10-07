let APIKey = "b929c0e3026118ea0292882110d701a8";
let APIGoogle = "AIzaSyC8sMIbviv9SzuRsivsw0OCB4ZEgRYXIEQ";
let citySearch = $("#citySearch");
let cityButtonSearch = $("#cityButtonSearch");
let geoArounMeButton = $("#geoArounMeButton");


let map;
let service;
let infowindow;

// Create the script tag, set the appropriate attributes
var script = document.createElement('script');
script.src = 'https://maps.googleapis.com/maps/api/js?key=' + APIGoogle + '&callback=initMap&libraries=places';
script.async = true;

// Attach your callback function to the `window` object
window.initMap = function () {
  // JS API is loaded and available
};

// Append the 'script' element to 'head'
document.head.appendChild(script);

// On click or enter button assigns city 
cityButtonSearch.on("click", inputCity);
citySearch.on("keyup", function (event) {
  if (event.keyCode === 13) {
    event.preventDefault();
    inputCity();
  }
});

function inputCity() {
  let city = citySearch.val();
  if (city === "") {
    console.log('Error Enter city name')
    return;
  }
  let queryURLCity = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=" + APIKey;
  citySearch.val("");
  fetchGeolocation(queryURLCity);
}

function fetchGeolocation(queryURLCity) {
  fetch(queryURLCity)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: data[0].lat, lng: data[0].lon },
        zoom: 14
      });
      let locationOnMap = new google.maps.LatLng(data[0].lat, data[0].lon);
      infowindow = new google.maps.InfoWindow();
      findPlace(locationOnMap);
    });
}

geoArounMeButton.on("click", getLocation);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      console.log("Latitude: ", position.coords.latitude);
      console.log("Longitude: ", position.coords.longitude);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function findPlace(locationOnMap) {
  let request = {
    location: locationOnMap,
    radius: '1500',
    type: ["restaurant"]
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    console.log(results)
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      for (let i = 0; i < results.length; i++) {
        createMarker(results[i]);
      }
      map.setCenter(results[0].geometry.location);
    }
  });
}

function createMarker(place) {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
  });

  google.maps.event.addListener(marker, "click", () => {
    const content = document.createElement("div");
    const nameElement = document.createElement("h2");

    nameElement.textContent = place.name;
    content.appendChild(nameElement);

    const placeIdElement = document.createElement("p");

    placeIdElement.textContent = place.vicinity;
    content.appendChild(placeIdElement);

    const placeAddressElement = document.createElement("p");

    placeAddressElement.textContent = "Rating: " + place.rating;
    content.appendChild(placeAddressElement);
    
    infowindow.setContent(content);
    infowindow.open(map, marker);
  });
}