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
      showMap(data[0].lat, data[0].lon);
    });
}

geoArounMeButton.on("click", getLocation);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      // console.log(position.coords.latitude, position.coords.longitude);
      showMap(position.coords.latitude, position.coords.longitude);
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

function showMap(lat, lon) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: lat, lng: lon },
    zoom: 14
  });
  let locationOnMap = new google.maps.LatLng(lat, lon);
  infowindow = new google.maps.InfoWindow();
  findPlace(locationOnMap);
}

function findPlace(locationOnMap) {
  $('#Search-List').empty();   // clean list before new search
  let request = {
    location: locationOnMap,
    radius: '1500',
    type: ["restaurant"],
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {  // add after status" , pagetoken"  - for more than 20 results
    console.log(results);
    // if (pagetoken.hasNextPage) {
    //   pagetoken.nextPage(results);
    // }
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      ResultsData(results);
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

    const placeAddress = document.createElement("p");

    placeAddress.textContent = place.vicinity;
    content.appendChild(placeAddress);

    const placePriceLevel = document.createElement("p");

    placePriceLevel.textContent = "Price Level: " + priceLevelConvert(place.price_level);
    content.appendChild(placePriceLevel);

    const placeRating = document.createElement("p");

    placeRating.textContent = "Rating: " + place.rating;
    content.appendChild(placeRating);

    const placeSave = document.createElement("button");

    placeSave.textContent = "Save";
    content.appendChild(placeSave);

    placeSave.addEventListener("click", () => {
      let restaurantInfo = {
        name: "",
        address: "",
      }
      restaurantInfo.name = placeSave.parentElement.firstChild.textContent;
      restaurantInfo.address = placeSave.parentElement.children[1].textContent;
      saveRestaurant.push(restaurantInfo);
      localStorage.setItem("restaurants", JSON.stringify(saveRestaurant));
    });

    infowindow.setContent(content);
    infowindow.open(map, marker);
  });
}

function priceLevelConvert(price_level) {
  let returnPriceSymbol = "";
  switch (price_level) {
    case 0:
      returnPriceSymbol = "free";
      break;
    case 1:
      returnPriceSymbol = "$";
      break;
    case 2:
      returnPriceSymbol = "$$";
      break;
    case 3:
      returnPriceSymbol = "$$$";
      break;
    case 4:
      returnPriceSymbol = "$$$$";
      break;
    default:
      returnPriceSymbol = "No price info"
  }
  return returnPriceSymbol;
}

function ResultsData(results) {
    for (var i = 0; i < results.length; i++) {
        var searchResults = results[i].name
        var searchAddress = results[i].vicinity
        var div = $('<div>');

        div.append($('<h3>').text(searchResults));
        div.append($('<p>').text(searchAddress));
        div.append($('<button>').attr('type', 'button').addClass('restaurantSaveButton button is-primary is-small').addClass('is-success').text('Save'));
        $(`#Search-List`).append(div);
    }
}

let saveRestaurant = [];
$('#Search-List').on("click", saveIt);

function saveIt(event) {
  let restaurantInfo = {
    name: "",
    address: "",
  }
  restaurantInfo.name = $(event.target).prev().prev().text();
  restaurantInfo.address = $(event.target).prev().text();
  if (!checkArray(restaurantInfo)) {
    saveRestaurant.push(restaurantInfo);
    localStorage.setItem("restaurants", JSON.stringify(saveRestaurant));
  }
  $('#Saved-Search').empty();
  printDataFromLocalStorage()
}

//Reads and displays from local storage
$(document).ready(getDataFromMemory);

function getDataFromMemory() {
  saveRestaurant = JSON.parse(localStorage.getItem("restaurants"));
  if (saveRestaurant === null) {
    saveRestaurant = [];
  }
  printDataFromLocalStorage()
}

function printDataFromLocalStorage() {
  for (var i = 0; i < saveRestaurant.length; i++) {
    var saveSearchEl = $('#Saved-Search')
    var div = $('<div>');  //.attr('id', "location"+i)
    div.append($('<h3>').text(saveRestaurant[i].name));
    div.append($('<p>').text(saveRestaurant[i].address));
    div.append($('<button>').attr('type', 'button').addClass('restaurantSaveButton button is-danger is-small').text('Delete').on('click', deleteIt));
    saveSearchEl.append(div);
  }
}

// Checking saved array it elemrnt exist
function checkArray(restaurantInfo) {
  for (var i = 0; i < saveRestaurant.length; i++) {
    if (saveRestaurant[i].name === restaurantInfo.name) {
      console.log('Restaurant Exist')
      return true;
    }
  }
}

// Deleting element from Saved list
function deleteIt() {
  let divIndex = $(this).parent().index();
  saveRestaurant.splice(divIndex, 1)
  localStorage.setItem("restaurants", JSON.stringify(saveRestaurant));
  $('#Saved-Search').empty();
  printDataFromLocalStorage()
}
