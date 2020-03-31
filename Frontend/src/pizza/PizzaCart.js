/**
 * Created by chaika on 02.02.16.
 */
var Templates = require('../Templates');
var Storage = require('./Storage');
var API = require('../API');

//Перелік розмірів піци
var PizzaSize = {
    Big: "big_size",
    Small: "small_size"
};

//Змінна в якій зберігаються перелік піц в кошику
var Cart = [];

//HTML едемент куди будуть додаватися піци
var $cart = $("#cart");
var $header_cart = $(".top-part");

function addToCart(pizza, size) {
    //Додавання однієї піци в кошик покупок
    function isPresent (){
        for (let i = 0 ; i < Cart.length; i++){
            if(Cart[i].pizza.id == pizza.id
                && size == Cart[i].size)
                return i;
        }
        return -1;
    }
    var checkPresence = isPresent();
    if (checkPresence === -1){
        Cart.push({
            pizza: pizza,
            size: size,
            quantity: 1
        });
    } else {
        Cart[checkPresence].quantity++;
    }

    //Оновити вміст кошика на сторінці
    updateCart();
}

function removeFromCart(cart_item) {
    //Видалити піцу з кошика
    Cart.splice(Cart.indexOf(cart_item),1);

    //Після видалення оновити відображення
    updateCart();
}

function initialiseCart() {
    //Фукнція віпрацьвуватиме при завантаженні сторінки
    //Тут можна наприклад, зчитати вміст корзини який збережено в Local Storage то показати його
    var prevCart = Storage.read("cart");
    if (prevCart) {
        Cart = prevCart;
    }
    updateCart();
}

function getPizzaInCart() {
    //Повертає піци які зберігаються в кошику
    return Cart;
}

function totalSum() {
    var sum = 0;
    Cart.forEach(function (pizzaItem) {
        sum += pizzaItem.pizza[pizzaItem.size].price * pizzaItem.quantity;
    });
    return sum;
}

function updateCart() {
    //Функція викликається при зміні вмісту кошика
    //Тут можна наприклад показати оновлений кошик на екрані та зберегти вміт кошика в Local Storage
    var pizzaAmount = Cart.length;
    $(".sum-number").text(totalSum() + " uah");
    $(".order-count").text(pizzaAmount);
    Storage.write("cart",Cart);
    //Очищаємо старі піци в кошику
    $cart.html("");

    var sumOfOnePizza = 0;
    //Онволення однієї піци
    function showOnePizzaInCart(cartItem) {
        var code;
        if($(".clear-order").html() === undefined){
            code = Templates.PizzaCart_OneItemSubmit(cartItem);
        }else{
            code = Templates.PizzaCart_OneItem(cartItem);
        }
        let $node = $(code);

        $node.find(".plus").click(function(){
            //Збільшуємо кількість замовлених піц
            cartItem.quantity += 1;
            sumOfOnePizza = cartItem.pizza[cartItem.size].quantity
                * cartItem.pizza[cartItem.size].price;

            $(".price").text(sumOfOnePizza);
            //Оновлюємо відображення
            updateCart();
        });

        $node.find(".minus").click(function (){
            if(cartItem.quantity === 1){
                removeFromCart(cartItem);
                updateCart();
            } else{
                --cartItem.quantity;
                sumOfOnePizza -= cartItem.pizza[cartItem.size].price;
                $(".price").text(sumOfOnePizza);
                //Оновлюємо відображення
                updateCart();
            }
        });

        $node.find(".count-clear").click(function(){
            removeFromCart(cartItem);
            updateCart();
        });
        $header_cart.find(".clear-order").click(function () {
            clearCart();
            updateCart();
        });

        $cart.append($node);
    }

    Cart.forEach(showOnePizzaInCart);

    if (pizzaAmount === 0) {
        $cart.html(' <div class="no-order-text">'+
        'No pizza is ordered'+'</div>');
        $(".sum-title").hide();
        $(".sum-number").hide();
        $(".button-order").prop("disabled", true);
    } else {
        $(".sum-title").show();
        $(".sum-number").show();
        $(".button-order").prop("disabled", false);
    }

}

function createOrder(callback) {
    API.createOrder({
        Name: $("#inputName").val(),
        Phone: $("#inputPhone").val(),
        Address: $("#inputAddress").val(),
        Pizzas: getPizzaInCart(),
        Sum: totalSum()
    },
        function (err, result) {
        if(err) return callback(err);
        callback(null,  result);
    })
}

function clearCart() {
    Cart.splice(0, Cart.length);
    // $(".clear-order").click(function () {
    //     console.log("Clear order button");
    //     Cart = [];
    //     $(".order-count").text(0);
    //     updateCart();
    // });
}

exports.removeFromCart = removeFromCart;
exports.addToCart = addToCart;

exports.getPizzaInCart = getPizzaInCart;
exports.initialiseCart = initialiseCart;
exports.createOrder = createOrder;

exports.clearCart = clearCart;
exports.PizzaSize = PizzaSize;