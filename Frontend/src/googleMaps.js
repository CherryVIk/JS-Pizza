var old_marker = null;
var map;

function initialize() {
//Тут починаємо працювати з картою
    var mapProp = {
        center: new google.maps.LatLng(50.464379, 30.519131),
        zoom: 11
    };
    var html_element = document.getElementById("googleMaps");
    map = new google.maps.Map(html_element, mapProp);

    //show shop marker
    var point = new google.maps.LatLng(50.464379, 30.519131);
    var shopMarker = new google.maps.Marker({
        position: point,
        map: map,
        icon: "assets/images/map-icon.png"
    });
    //Карта створена і показана

    google.maps.event.addListener(map, 'click', function (me) {
        var coordinates = me.latLng; //coordinates	- такий самий об’єкт як створений new google.maps.LatLng(...)
        updateMarker(coordinates);

        geocodeLatLng(coordinates, function (err, address) {
            if (!err) {
                $(".order-adress").text(address);
                $("#inputAddress").val(address);
            } else {
                $(".order-adress").text("No address");
            }
        });

        calculateRoute(point, coordinates, function (err, data) {
            if(!err){
                $(".order-time").text(data.duration.text);
            }else{
                $(".order-time").text("Error");
            }
        })
    });
}

//адресу за координатами
function geocodeLatLng(latlng, callback) {
//Модуль за роботу з адресою
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'location': latlng}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK && results[1]) {
            var adress = results[1].formatted_address;
            callback(null, adress);
        } else {
            callback(new Error("Can't find adress"));
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

function updateMarker(coordinates) {
    if (old_marker) {
        old_marker.setMap(null);
        old_marker = null;
    }

    old_marker = new google.maps.Marker({
        position: coordinates,
        map: map,
        icon: "assets/images/home-icon.png"
    });
}

function calculateRoute(A_latlng, B_latlng, callback) {
    var directionService = new google.maps.DirectionsService();
    directionService.route({
        origin: A_latlng,
        destination: B_latlng,
        travelMode: google.maps.TravelMode["DRIVING"]
    }, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            var leg = response.routes[0].legs[0];
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
exports.updateMarker = updateMarker;
exports.calculateRoute = calculateRoute;
