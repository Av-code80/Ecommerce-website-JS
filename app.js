//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];
// buttons
let buttonsDOM = [];
//===
// getting the product
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();  //get data from json
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products in JS
class UI {
  displayProducts(products) {
    let result = "";
    // products.forEach((product) =>
    products.forEach(product => {
      result += `
           <!-- Single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image}alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}/h4>
            </article>
         `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")]; //to exit it from node
    buttonsDOM = buttons;

    buttons.forEach(button => { //getting id of each button
      let id = button.dataset.id; 
      let inCart = cart.find((item) => item.id === id); //when page load, cart can get info

      if (inCart) { // if exist in cart
        button.innerText = "In Cart";
        button.disabled = true;
      } 
      else { // if doesn't exist in empty cart[]
        button.addEventListener("click", (event) => {
          event.target.innerText = "In Cart";
          event.target.disabled = true;
          // get product from products => in Storage method
          let cartItem = { ...Storage.getProduct(id), amount: 1 }; //then add items to cart
          console.log(cartItem);
          // add product to the cart
          cart = [...cart, cartItem];
          // save cart in local storage-save amount when relode page
          Storage.saveCart(cart);
          // set cart values
          this.setCartValues(cart);
          // display cart item
          this.setCartItem(cartItem);
          // show the cart
          this.showCart();
        });
      }
    });
  }
  setCartValues(cart) {
    let tempTotal = 0; // cart total
    let itemsTotal = 0; 
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  setCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innertHTML = ` <div class="cart-item">  
                      <img src=${item.image}
                    alt="product">
                   <div>
                       <h4>${item.title}/h4>
                       <h5>${item.price}</h5>
                    <span class="remove-item" 
                    data-id=${item.id}>remove</span>
                   </div>
                   <div>
                       <i class="fas fa-chevron-up" 
                       data-id=${item.id}></i>
                       <p class="item-amount">${item.amount}</p>
                       <i class="fas fa-chevron-down"
                       data-id=${item.id}></i>
                   </div></div>`;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupAPP() { //idea is when page loaded
    cart = Storage.getCart(); //cart ll be assign value from the storage
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("treansparentBcd");
    cartDOM.classList.remove("showCart");
  }
  // clear cart button
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", (event) => { // for removing from cart
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target; //remove id from cart and DOM
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } 
      else if (event.target.classList.containes("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;

        Storage.saveCart(cart); //when we update tempItem.amount, cart is also updated
        this.setCartValues(cart); //updating cart total and all element in it
        addAmount.nextElementSibling.innerText = tempItem.amount; //update amount btwn chevron
      } 
      else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id); //decrease amount
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart); //save last value in cart
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItems = cart.map((id) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart.filter((item) => item.id !== id);
    this.setCartValues(cart); //updating cart to show 0
    Storage.saveCart(cart); // give laste value of cart
    let button = this.getSingleButton(id); //remove item from the buttons of products and turn it back to the first
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
  }
  getSingleButton(id) {
    //find specific button btwn all buttons
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// local storage - create static method here to can initiate it without making an instance class
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    // first check if item exist in localstorage,
    return localStorage.getItem("cart")?
      JSON.parse(localStorage.getItem("cart")) : []; //second doesn't exist
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup app
  ui.setupAPP();
  // get all products
  products.getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
