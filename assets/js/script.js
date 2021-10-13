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

// // Looking for a geo coordinates 
function inputCity() {
  let city = citySearch.val();
  if (city === "") {
    errorMsg('Enter City Name');
    console.log('Enter City Name')
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
      console.log(data)
      if (data.length === 0){
        errorMsg("Can't Find Entered City");
      } else {
        showMap(data[0].lat, data[0].lon);
      }
    });
}

geoArounMeButton.on("click", getLocation);

// Reading geolocation from browser
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      // console.log(position.coords.latitude, position.coords.longitude);
      showMap(position.coords.latitude, position.coords.longitude);
    });
  } else {
    errorMsg("Geolocation is not supported by this browser.")
    console.log("Geolocation is not supported by this browser.");
  }
}

// Displays map
function showMap(lat, lon) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: lat, lng: lon },
    zoom: 14
  });
  let locationOnMap = new google.maps.LatLng(lat, lon);
  infowindow = new google.maps.InfoWindow();
  findPlace(locationOnMap);
}

//Searching for near by places
function findPlace(locationOnMap) {
  $('#Search-List').empty();   // clean list before new search
  let request = {
    location: locationOnMap,
    radius: '1500',
    type: ["restaurant"],
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {  // add after status" , pagetoken"  - for more than 20 results
    //console.log(results);
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

//Creating pins on map with info
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
    content.appendChild(nameElement).setAttribute("style", "font-weight: bold;");

    const placeAddress = document.createElement("p");

    placeAddress.textContent = place.vicinity;
    content.appendChild(placeAddress);

    const placePriceLevel = document.createElement("p");

    placePriceLevel.innerHTML = "<strong>Price Level: </strong>" + priceLevelConvert(place.price_level);
    content.appendChild(placePriceLevel);

    const placeRating = document.createElement("p");

    placeRating.innerHTML = "<strong>Rating: </strong>" + place.rating;
    content.appendChild(placeRating);

    const placeSave = document.createElement("button");

    placeSave.textContent = "Save";
    content.appendChild(placeSave);

// Saves in local memory from map
    placeSave.addEventListener("click", () => {
      let restaurantInfo = {
        name: "",
        address: "",
        placeId: "",
        lon: "",
        lat: "",
      }

      restaurantInfo.placeId = place.place_id;
      restaurantInfo.name = place.name;
      restaurantInfo.address = place.vicinity;
      restaurantInfo.lon = place.geometry.viewport.Hb.g;
      restaurantInfo.lat = place.geometry.viewport.tc.g;
      if (!checkArray(restaurantInfo)) {
        saveRestaurant.push(restaurantInfo);
        localStorage.setItem("restaurants", JSON.stringify(saveRestaurant));
      }
      $('#Saved-Search').empty();
      printDataFromLocalStorage()
    });

    infowindow.setContent(content);
    infowindow.open(map, marker);
  });
}

// Converts price level  to symbols
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

//Displays search resuls 
function ResultsData(results) {
  for (var i = 0; i < results.length; i++) {
    var searchResults = results[i].name
    var placeId = results[i].place_id
    var searchAddress = results[i].vicinity
    var lat = results[i].geometry.viewport.tc.g;
    var lon = results[i].geometry.viewport.Hb.g;
    var div1 = $('<div>').addClass("card customCardHead");
    var div2 = $('<div>').addClass("card-header");

    div2.append($('<p>').text(lat).css("display", "none"))
    div2.append($('<p>').text(lon).css("display", "none"))
    div2.append($('<p>').text(placeId).css("display", "none"))
    div2.append($('<p>').text(searchResults).addClass("card-header-title"));
    div2.append($('<button type="button" class="card-header-icon button is-success is-small">Save</button>').on("click", saveIt));

    var div3 = $('<div>').addClass("card-content customCardText");
    div3.append($('<p>').text(searchAddress).addClass("content"));

    $('#Search-List').append(div1.append(div2));
    $('#Search-List').append(div1.append(div3));
  }
}

let saveRestaurant = [];

// Saves in local memory from search list
function saveIt() {
  let restaurantInfo = {
    name: "",
    address: "",
    placeId: "",
    lon: "",
    lat: "",
  }
  restaurantInfo.lat = parseFloat($(this).prev().prev().prev().prev().text());
  restaurantInfo.lon = parseFloat($(this).prev().prev().prev().text());
  restaurantInfo.placeId = $(this).prev().prev().text();
  restaurantInfo.name = $(this).prev().text();
  restaurantInfo.address = $(this).parent().next().children().eq(0).text();
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

//Displays history
function printDataFromLocalStorage() {
  for (var i = 0; i < saveRestaurant.length; i++) {
    var div1 = $('<div>').addClass("card customCardHead customCursor");
    var div2 = $('<div>').addClass("card-header");
    div2.append($('<p>').text(saveRestaurant[i].name).addClass("card-header-title"));
    div2.append($('<button type="button" class="card-header-icon button is-danger is-small">Delete</button>').on("click", deleteIt));

    var div3 = $('<div>').addClass("card-content customCardText");
    div3.append($('<p>').text(saveRestaurant[i].address).addClass("content"));

    $('#Saved-Search').append(div1.append(div2));
    $('#Saved-Search').append(div1.append(div3).on("click", showOnMap));
  }
}

// Checking saved array it elemrnt exist
function checkArray(restaurantInfo) {
  for (var i = 0; i < saveRestaurant.length; i++) {
    if (saveRestaurant[i].name === restaurantInfo.name) {
      console.log('Restaurant Exist In Your History')
      errorMsg('Restaurant Exist In Your History');
      return true;
    }
  }
}

// Deleting element from Saved list
function deleteIt() {
  let divIndex = $(this).parent().parent().index();
  saveRestaurant.splice(divIndex, 1)
  localStorage.setItem("restaurants", JSON.stringify(saveRestaurant));
  $('#Saved-Search').empty();
  printDataFromLocalStorage()
}

function showOnMap() {
  $('#Search-List').empty();
  let placeIndex = $(this).index();
  initMapByAddress(saveRestaurant[placeIndex].placeId, saveRestaurant[placeIndex].lat, saveRestaurant[placeIndex].lon)
}

//Displays map amd pin from saved history
function initMapByAddress(placeIdFromArray, lat, lon) {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: lat, lng: lon },
    zoom: 15,
  });
  const request = {
    placeId: placeIdFromArray,
  };
  const infowindow = new google.maps.InfoWindow();
  const service = new google.maps.places.PlacesService(map);

  service.getDetails(request, (place, status) => {
    if (
      status === google.maps.places.PlacesServiceStatus.OK &&
      place &&
      place.geometry &&
      place.geometry.location
    ) {
      const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
      });

      google.maps.event.addListener(marker, "click", () => {
        const content = document.createElement("div");
        const nameElement = document.createElement("h2");

        nameElement.textContent = place.name;
        content.appendChild(nameElement).setAttribute("style", "font-weight: bold;");

        const placeAddress = document.createElement("p");

        placeAddress.textContent = place.vicinity;
        content.appendChild(placeAddress);

        const placePriceLevel = document.createElement("p");

        placePriceLevel.innerHTML = "<strong>Price Level: </strong>" + priceLevelConvert(place.price_level);
        content.appendChild(placePriceLevel);

        const placeRating = document.createElement("p");

        placeRating.innerHTML = "<strong>Rating: </strong>" + place.rating;
        content.appendChild(placeRating);

        infowindow.setContent(content);
        infowindow.open(map, marker);
      });
    }
  });
}

//Error mesage window
function errorMsg(msg) {
  var left = (screen.width - 400) / 2;
  var top = (screen.height - 400) / 4;
  var myWindow = window.open("Error", "MsgWindow", "toolbar=no,scrollbars=yes,resizable=yes,top=" + top + ",left=" + left + ",width=400,height=400");
  myWindow.document.write('<h1>' + msg + '</h1>');
}