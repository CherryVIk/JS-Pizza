var PizzaMenu = require('./PizzaMenu');
var PizzaCart = require('./PizzaCart');
var googleMaps = require('../googleMaps');
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
var changeBackground = function (element,color,display){
    element.find(".form-control").css("background", color);
    element.find(".help-block").css("display", display);
};
function nameValid() {
    var expr = $("#inputName").val();
    if (!/^[A-Za-zА-Яа-яІіЇїЄєҐґ'/ -]+$/.test(expr)) {
        changeBackground($(".name-group"),'rgba(255,7,18,0.36)',"inline-block");
        return false;
    }
    else {
        changeBackground($(".name-group"),'rgba(100,252,38,0.37)',"none");
        contact_info.name = $("#inputName").val();
        Storage.write("info", contact_info);
        return true;
    }
   }

function phoneValid() {
    var expr = $("#inputPhone").val();
    if ((!/^[+]?(38)?([0-9]{10})$/.test(expr) && (!/^0?([0-9]{9})$/.test(expr)))) {
        changeBackground($(".phone-group"),'rgba(255,7,18,0.36)',"inline-block");
        return false;
    }else {
        changeBackground($(".phone-group"),'rgba(100,252,38,0.37)',"none");
        contact_info.phone = $("#inputPhone").val();
        Storage.write("info", contact_info);
        return true;
    }
}

function addressValid() {
    googleMaps.geocodeAddress($("#inputAddress").val(), function (err, location) {
        if(err){
            console.log($("#inputAddress").val());
            alert("Не вдалося встановити адресу.");
            changeBackground($(".address-group"),'rgba(255,7,18,0.36)',"inline-block");
            $(".order-time").text("не відомо");
            $(".order-adress").text("не відомо");
        }else {
            googleMaps.calculateRoute(new google.maps.LatLng(50.464379, 30.519131), location, function (err, data) {
                if (!err)
                    $(".order-time").text(data.duration.text);
                else {
                    console.log(err);
                }
            });
            changeBackground($(".address-group"),'rgba(100,252,38,0.37)',"none");

            contact_info.address = $("#inputAddress").val();
            Storage.write("info", contact_info);

            $(".order-adress").text($("#inputAddress").val());
        }
    });
}

$(".next-step-button").click(function () {
    addressValid();
    var valid = nameValid() && phoneValid() && $(".order-time").text() != "невідомо";

    if (valid) {
        PizzaCart.createOrder(function (err, data) {
            if (err) {
                alert("Замовлення не створено");
                return console.log("Замовлення не створено в API")
            }
            alert("Замовлення створено");

            LiqPayCheckout.init({
                data: data.data,
                signature: data.signature,
                embedTo: "#liqpay_checkout",
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
        alert("Заповніть усі поля!");
    }

});

$("#inputName").on("input",nameValid);
$("#inputPhone").on("input",phoneValid);
$("#inputAddress").keyup(function (key) {
    if (key.keyCode == 13) addressValid();

});

exports.initialiseOrder = initialiseOrder;