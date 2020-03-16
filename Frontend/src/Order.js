var PizzaMenu = require('./pizza/PizzaMenu');
var PizzaCart = require('./pizza/PizzaCart');
var Pizza_List = require('./Pizza_List');
var Storage = require('./pizza/Storage');
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
})

$(".clear-cart").click(function () {
    PizzaCart.clearCart();
});

$("#inputName").on("input", function () {
    if (!nameValid()) {
        $(".name-help-block").show();
    } else {
        $(".name-help-block").hide();
    }
});

$("#inputPhone").on("input", function () {
    if (!phoneValid()) {
        $(".phone-help-block").show();
    } else {
        $(".phone-help-block").hide();
    }
});

$("#inputAddress").on("input", function () {
    if (!addressValid()) {
        $(".address-help-block").show();
    } else {
        $(".address-help-block").hide();
    }

    googleMaps.geocodeAddress($("#inputAddress").val(), function (err, coordinates) {
        if (!err) {
            googleMaps.geocodeLatLng(coordinates, function (err, address) {
                if (!err) {
                    $(".order-adress").text($("#inputAddress").val());
                    googleMaps.updateMarker(coordinates);
                    googleMaps.calculateRoute(new google.maps.LatLng(50.464379, 30.519131), coordinates, function (err, data) {
                        if (!err) {
                            $(".order-time").text(data.duration.text);
                        } else {
                            $(".order-time").text("Помилка");
                        }
                    })
                } else {
                    $(".order-adress").text("Немає адреси");
                }
            });
        }
    });


});

function nameValid() {
    var expr = $("#inputName").val();
    return expr.match(/^([a-zA-Zа-яА-Я]+|[a-zA-Zа-яА-Я]+[ ][a-zA-Zа-яА-Я]+|([a-zA-Zа-яА-Я]+[\-][a-zA-Zа-яА-Я]+))+$/);
}

function phoneValid() {
    var expr = $("#inputPhone").val();
    return expr.match(/^(\+380\d{9}|0\d{9})$/);
}

function addressValid() {
    if ($("#inputAddress").val() === "") {
        $(".address-help-block").show();
        return false
    } else $(".address-help-block").hide();
    return true;
}

$(".next-step-button").click(function () {
    if (!nameValid()) {
        $(".name-help-block").show();
    } else $(".name-help-block").hide();
    if (!phoneValid()) {
        $(".phone-help-block").show();
    } else $(".phone-help-block").hide();
    if (!addressValid()) {
        $(".address-help-block").show();
    } else $(".address-help-block").hide();

    if (nameValid() && phoneValid() && addressValid()) {

        contact_info.name = $("#inputName").val();
        contact_info.phone = $("#inputPhone").val();
        contact_info.address = $("#inputAddress").val();
        Storage.write("info", contact_info);

        PizzaCart.createOrder(function (err, data) {
            if (err) {
                return alert("Can't create order");
            }
            alert("Order created");

            LiqPayCheckout.init({
                data: data.data,
                signature: data.signature,
                embedTo: "#liqpay",
                mode: "embed"	//	popup	||	popup
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
    }
});
exports.initialiseOrder = initialiseOrder;