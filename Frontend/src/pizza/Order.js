var PizzaMenu = require('./PizzaMenu');
var PizzaCart = require('./PizzaCart');
var GoogleMaps = require('../googleMaps');
var Storage = require('./Storage');

var contact_info = {
    name: "",
    phone: "",
    address: ""
};

function initialiseOrder(){
    var contact_info = Storage.read("info");
    if (contact_info) {
        if (contact_info.name) {
            $("#inputName").val(contact_info.name);
            nameValid();
        }
        if (contact_info.phone) {
            $("#inputPhone").val(contact_info.phone);
            phoneValid();
        }
        if (contact_info.address) {
            $("#inputAddress").val(contact_info.address);
            addressValid();
        }
    }
}

$(".nav-pills li").on("click", function () {
    $(".nav-pills li").removeClass("active");
    $(this).addClass("active");
    var filt = $(this).find('a').data("filter");
    PizzaMenu.filterPizza(filt);
});

$(".clear-order").click(function () {
    PizzaCart.clearCart();
});
$("#inputName").keyup(nameValid);
$("#inputPhone").keyup(function () {
    phoneValid();
    console.log("key up is called");
});
$("#inputAddress").keyup(function (key) {

    if (key.keyCode == 13) addressValid();

});
function nameValid() {
    if (!/^[0-9A-Za-zА-Яа-яІіЇїЄєҐґ'/ -]+$/.test($("#inputName").val())) {
        $(".name-help-block").show();
        return false;
    }
    else {
        $(".name-help-block").hide();
        contact_info.name = $("#inputName").val();
        Storage.write("info", contact_info);
        return true;
    }
    // var expr = $("#inputName").val();
    // // return expr.match(/^[0-9A-Za-zА-Яа-яІіЇїЄєҐґ'/ -]+$/);
    // return expr.match(/^([a-zA-Zа-яА-Я]+|[a-zA-Zа-яА-Я]+[ ][a-zA-Zа-яА-Я]+|([a-zA-Zа-яА-Я]+[\-][a-zA-Zа-яА-Я]+))+$/);
}

function phoneValid() {
    if ((!/^[+]?(38)?([0-9]{10})$/.test($("#inputPhone").val()) && (!/^0?([0-9]{9})$/.test($("#inputPhone").val())))) {
        $(".phone-help-block").show();
        return false;
    }else {
        $(".phone-help-block").hide();
        contact_info.phone = $("#inputPhone").val();
        Storage.write("info", contact_info);
        return true;
    }
    // var expr = $("#inputPhone").val();
    // return expr.match(/^(\+380\d{9}|0\d{9})$/);
}

function addressValid() {
    GoogleMaps.geocodeAddress($("#inputAddress").val(), function (err, location) {
        if(err){
            alert("Не вдалося встановити адресу.");
            $(".address-help-block").show();
        }else {
            GoogleMaps.calculateRoute(new google.maps.LatLng(50.464379, 30.519131), location, function (err, data) {
                if (!err)
                    $(".order-time").text(data.duration.text);
                else {
                    console.log(err);
                }
            });
            contact_info.address = $("#inputAddress").val();
            Storage.write("info", contact_info);
            $(".address-help-block").hide();
            $(".order-address").text($("#inputAddress").val());
        }
    });
}

$(".next-step-button").click(function () {
    addressValid();
    var valid = nameValid() && phoneValid() && $(".order-time").text() != "unknown";

    if (valid) {

        PizzaCart.createOrder(function (err, data) {
            if (err) {
                alert("Can't create order");
                return console.log("Can't create order in API")
            }
            alert("Order created");

            LiqPayCheckout.init({
                data: data.data,
                signature: data.signature,
                embedTo: "#liqpay",
                mode: "popup"	//	embed	||	popup
            }).on("liqpay.callback", function (data) {
                console.log(data.status);
                console.log(data);
                alert("Order status: " + data.status);
            }).on("liqpay.ready", function (data) {
                //	ready
            }).on("liqpay.close", function (data) {
                //	close
            });
        });
    }else {
        alert("Fill all fields!");
    }

});

exports.initialiseOrder = initialiseOrder;