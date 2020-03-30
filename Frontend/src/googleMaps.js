var homeMark;
var map;
var directionsDisplay;

function initialize() {
//Тут починаємо працювати з картою
    directionsDisplay = new google.maps.DirectionsRenderer();
    var point = new google.maps.LatLng(50.464379, 30.519131);
    var mapProp = {
        center: point,
        zoom: 11
    };
    var html_element = document.getElementById("googleMaps");

    map = new google.maps.Map(html_element, mapProp);

    directionsDisplay.setMap(map);
    directionsDisplay.setOptions({suppressMarkers: true});
    //show shop marker
    var marker = new google.maps.Marker({
        position: point,
        map: map,
        icon: {
            url: "assets/images/map-icon.png",
            anchor : new google.maps.Point(30,30)
        }
    });
    //Карта створена і показана

    google.maps.event.addListener(map, 'click', function (me) {
        var coordinates = me.latLng; //coordinates	- такий самий об’єкт як створений new google.maps.LatLng(...)

        geocodeLatLng(coordinates, function (err, address) {
            if (!err) {
                $(".order-address").text(address);
                $("#inputAddress").val(address);
                $(".address-help-block").hide();
                if(homeMark) homeMark.setMap(null);

                homeMark = new google.maps.Marker({
                    position: coordinates,
                    map: map,
                    icon : {
                        url: "assets/images/map-icon.png",
                        anchor : new google.maps.Point(30,30)
                    }
                });
                calculateRoute(point, coordinates, function (err, data) {
                    if(!err){
                        $(".order-time").text(data.duration.text);
                    }else{
                        console.log(err);
                        $(".order-time").text("Помилка");
                    }
                });

            } else {
                console.log(err);
                $(".order-address").text("Немає адреси");
            }
        });


    });
}

//адресу за координатами
function geocodeLatLng(latlng, callback) {
//Модуль за роботу з адресою
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'location': latlng}, function (results, status) {
        if (status === 'OK') {
            var address = results[1].formatted_address;
            callback(null, address);
        } else {
            callback(new Error("Can't find address"));
        }
    });
}

//координати за адресою
function geocodeAddress(address, callback) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': address}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            var coordinates = results[0].geometry.location;
            callback(null, coordinates);
        } else {
            callback(new Error("Can not find the address"));
        }
    });
}

function calculateRoute(A_latlng, B_latlng, callback) {
    var directionService = new google.maps.DirectionsService();
    directionService.route({
        origin: A_latlng,
        destination: B_latlng,
        travelMode: "DRIVING"
    }, function (response, status) {
        if (status == 'OK') {
            var leg = response.routes[0].legs[0];
            directionsDisplay.setDirections(response);
            callback(null, {
                duration: leg.duration
            });
        } else {
            callback(new Error("Can not	find direction"));
        }
    });
}

//Коли сторінка завантажилась
google.maps.event.addDomListener(window, 'load', initialize);

exports.geocodeAddress = geocodeAddress;
exports.geocodeLatLng = geocodeLatLng;
exports.calculateRoute = calculateRoute;
exports.initialize = initialize;

