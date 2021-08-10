//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const carDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// cart
let cart = [];
// buttons
let buttonsDOM = [];

// getting the product
class Products {
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
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
// display products
class UI {
  displayProducts(products) {
    let result = "";
    // products.forEach((product) =>
    products.forEach((product) => {
      result += `
           <!-- Single product -->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image}alt="product" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}/h4>
            </article>
         `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButton() {
    const buttons = [...document.querySelectorAll("bag-btn")]; //??
    buttonsDOM = buttons;

    buttons.forEach((button) => {
        let id = button.dataset.id;    //dataset??    
        let inCart = cart.find(item => item.id === id);

        if(inCart) {                            //if exist in cart
            button.innerText = "In Cart";
            button.disabled = true;
        }
        else {                          //if doesn't exist in empty cart[]
            button.addEventListener('click', event => {
                event.target.innerText = "In Cart";
                event.target.disabled = true;
                // get product from products => in storage method
                let cartItem = {...Storage.getProduct(id), amount: 1}; //then add items to cart
                console.log(cartItem);
                // add product to the cart
                cart = [...cart, cartItem];
                // save cart in local storage-save amount when relode page
                Storage.saveCart(cart)
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
            cart.map(item => {
              tempTotal += item.price * item.amount;
              itemsTotal += item.amount;
            });
            cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
            cartItems.innerText = itemstotal;
          }
          addCartItem(item) {
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innertHTML = `  <img src=${item.image}
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
                   </div>`;
                   cartContent.appendChild(div);
          }
          showCart() {
            cartOverlay.classList.add('transparentBcd');
            cartDOM.classList.add("showCart");
          }
          setupAPP() {//idea is when page loaded
            cart = Storage.getCart(); //cart ll be assign value from the storage
            this.setCartValues(cart);
            this.populate(cart);
            cartBtn.addEventListener('click', this.showCart())
          }
          populateCart(cart) {
            cart.forEach(item =>this.addCartItem(item));
          }
        }
      

// local storage - create static method here to can initiate it without making an instance class
class Storage {
    static saveProducts(products) {
      localStorage.setItem("products",
       JSON.stringify(products));
    }
    static getProduct(id) {
      let products = JSON.parse(localStorage.getItem("products"));
      return products.find(product => product.id === id);
    }
    static saveCart(cart) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart(){//first check if item exist in localstorage,
      return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart")): []; //second doesn't exist
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup app
  ui.setupAPP();
  // get all products
  products
  .getProducts()
  .then((products) => {
  ui.displayProducts(products);
  Storage.saveProducts(products);
  }).then(() => {
    ui.getBagButton();
  });
});
