const Product = require("../model/product");
const User = require("../model/user");

exports.getShopProducts = (req, res, next) => {
  let cartProducts = [];
  if (req.session.user) {
    cartProducts = req.user.cart.items;
  }
  Product.find()
    .then((products) => {
      res.render("../views/shop/shop.pug", {
        title: "Shop",
        products: products,
        cartProductIDs: cartProducts,
      });
    })
    .catch((err) => console.log(err));
};

exports.getProductDetails = (req, res, next) => {
  const productId = req.params.productID;
  Product.findById(productId)
    .then((product) => {
      res.render("../views/shop/product-detail.pug", {
        prod: product,
      });
    })
    .catch((err) => console.log(err));
};

exports.getCartItems = (req, res, next) => {
  req.user
    .populate("cart.items.productID")
    .execPopulate()
    .then((users) => {
      const products = users.cart.items;
      res.render("../views/shop/display-cart.pug", {
        cartItems: products,
        title: "Cart",
      });
    });
};

exports.addCartItems = (req, res, next) => {
  const prodID = req.params.productID;
  Product.findById(prodID)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log("Added to cart");
      res.redirect("/cart");
    });
};
