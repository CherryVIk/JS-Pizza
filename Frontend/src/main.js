/**
 * Created by chaika on 25.01.16.
 */

$(function() {
    //This code will execute when the page is ready
    var PizzaCart = require('./pizza/PizzaCart');

    PizzaCart.initialiseCart();


    if (document.location.href == "http://localhost:5050/order.html") {

        var PizzaOrder = require('./pizza/Order');
        PizzaOrder.initialiseOrder();

    }else {

        var PizzaMenu = require('./pizza/PizzaMenu');
        PizzaMenu.initialiseMenu();

    }

});
