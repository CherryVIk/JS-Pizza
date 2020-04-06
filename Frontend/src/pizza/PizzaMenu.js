/**
 * Created by chaika on 02.02.16.
 */
var Templates = require('../Templates');
var PizzaCart = require('./PizzaCart');
var Pizza_List = require('../Pizza_List');

//HTML едемент куди будуть додаватися піци
var $pizza_list = $("#pizza_list");
var PizzaFilter = {
    All: 0,
    Meat: 1,
    Pineapple: 2,
    Mushroom: 3,
    Sea: 4,
    Veg: 5
};

function showPizzaList(list) {
    //Очищаємо старі піци в кошику
    $pizza_list.html("");

    //Онволення однієї піци
    function showOnePizza(pizza) {
        var html_code = Templates.PizzaMenu_OneItem({pizza: pizza});

        var $node = $(html_code);

        $node.find(".buy-big").click(function(){
            PizzaCart.addToCart(pizza, PizzaCart.PizzaSize.Big);
        });
        $node.find(".buy-small").click(function(){
            PizzaCart.addToCart(pizza, PizzaCart.PizzaSize.Small);
        });

        $pizza_list.append($node);
    }

    list.forEach(showOnePizza);
}

function filterPizza(filter) {
    //Масив куди потраплять піци які треба показати
    var pizza_shown = [];

    if(filter === PizzaFilter.All){
        Pizza_List.forEach(function(pizza){
            pizza_shown.push(pizza);
        });
        $(".all-pizza-title").text("Усі піци");
        $(".pizza-count").text("8");
    }
    else {
        if (filter === PizzaFilter.Mushroom) {
            Pizza_List.forEach(function (pizza) {
                //Якщо піца відповідає фільтру
                if (pizza.content.mushroom) pizza_shown.push(pizza);
            });
            $(".all-pizza-title").text("З грибами");
        } else if (filter === PizzaFilter.Meat) {
            Pizza_List.forEach(function (pizza) {
                //Якщо піца відповідає фільтру
                if (pizza.type ===  'М’ясна піца') pizza_shown.push(pizza);
            });
            $(".all-pizza-title").text("З м'ясом");
        } else if (filter === PizzaFilter.Pineapple) {
            Pizza_List.forEach(function (pizza) {
                //Якщо піца відповідає фільтру
                if (pizza.content.pineapple) pizza_shown.push(pizza);
            });
            $(".all-pizza-title").text("З ананасами");
        } else if (filter === PizzaFilter.Sea) {
            Pizza_List.forEach(function (pizza) {
                //Якщо піца відповідає фільтру
                if (pizza.content.ocean) pizza_shown.push(pizza);
            });
            $(".all-pizza-title").text("З морепродуктами");
        } else if (filter === PizzaFilter.Veg) {
            Pizza_List.forEach(function (pizza) {
                //Якщо піца відповідає фільтру
                if (pizza.type ===  'Вега піца') pizza_shown.push(pizza);
            });
            $(".all-pizza-title").text("Для веганів");
        }
        $(".pizza-count").text(pizza_shown.length);

    }

    //Показати відфільтровані піци
    showPizzaList(pizza_shown);
}
$(".nav-pills li").on("click", function () {
    $(".nav-pills li").removeClass("active");
    $(this).addClass("active");
    var filt = $(this).find('a').data("filter");
    filterPizza(filt);
});

function initialiseMenu() {
    //Показуємо усі піци
    showPizzaList(Pizza_List)
}

exports.filterPizza = filterPizza;
exports.initialiseMenu = initialiseMenu;