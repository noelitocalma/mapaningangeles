var mapStyles = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}]
  }
]
function CenterControl(controlDiv, map, currentPosition) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '22px';
  controlUI.style.marginLeft = '10px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontSize = '20px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '<i class="ion-pinpoint"></i>';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    map.setCenter(currentPosition);
  });
}

function NavigateControl(controlDiv, map, destination) {
  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginLeft = '10px';
  controlUI.style.marginBottom = '5px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to navigate';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontSize = '20px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '<i class="ion-navigate"></i>';
  controlUI.appendChild(controlText);

  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', function() {
    window.location = 'google.navigation:q' + destination.lat() + ',' + destination.lng()
  });
}

function initMap() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      var infoWindow = new google.maps.InfoWindow({map: map});
      var manila = {lat: 14.599512, lng: 120.984222};
      var map = new google.maps.Map(document.getElementById('map'), {
        center: currentPosition,
        scrollwheel: false,
        zoom: 13,
        mapTypeId: 'roadmap',
        styles: mapStyles
      });

      // Create the DIV to hold the control and call the CenterControl()
      // constructor passing in this DIV.
      var centerControlDiv = document.createElement('div');
      var navigateControlDiv = document.createElement('div');
      var centerControl = new CenterControl(centerControlDiv, map, currentPosition);

      centerControlDiv.index = 1;
      map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(centerControlDiv);

      var marker = new google.maps.Marker({
        position: currentPosition,
        map: map,
        title: 'Your here!'
      });

      // Pass the directions request to the directions service.
      var directionsDisplay = new google.maps.DirectionsRenderer({
        map: map
      });

      // Create the search box and link it to the UI element.
      var input = document.getElementById('input');
      var searchBox = new google.maps.places.SearchBox(input);
      // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

      // Bias the SearchBox results towards current map's viewport.
      map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
      });

      // Listen for the event fired when the user selects a prediction and retrieve
      // more details for that place.
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) return;

        places = places.filter(function(place) {
          return place.formatted_address.indexOf('Angeles') > -1;
        });

        if (places.length > 0) {
          var destination = places[0].geometry.location

          // Set destination, origin and travel mode.
          var request = {
            destination: destination,
            origin: currentPosition,
            travelMode: 'DRIVING'
          };

          var directionsService = new google.maps.DirectionsService();
          directionsService.route(request, function(response, status) {
            if (status == 'OK') {
              // Display the route on the map.
              directionsDisplay.setDirections(response);
              var navigateControl = new NavigateControl(navigateControlDiv, map, destination);
              navigateControl.index = 1;
              map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(navigateControlDiv);
            }
          });

          var service = new google.maps.DistanceMatrixService();
          var distanceContainer = document.getElementById('distance')
          service.getDistanceMatrix({
              origins: [currentPosition],
              destinations: [destination],
              travelMode: 'DRIVING',
              unitSystem: google.maps.UnitSystem.METRIC,
              avoidHighways: false,
              avoidTolls: false
            }, callback);

          function callback(response, status) {
            distanceContainer.innerHTML = `
              <p>Origin: ${response.originAddresses[0]}</p>
              <p>Destination: ${response.destinationAddresses[0]}</p>
              <p>Distance: ${response.rows[0].elements[0].distance.text}</p>
              <p>Travel Duration: ${response.rows[0].elements[0].duration.text}</p>
            `
          }
        } else {
          alert('Angeles mu');
          document.getElementById('input').value = ''
        }
      });
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

  function handleLocationError(browserHasGeolocation, infoWindow, currentPosition) {
    infoWindow.setPosition(currentPosition);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
  }
}
