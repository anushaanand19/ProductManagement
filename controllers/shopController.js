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
  let cartProducts = [];
  if (req.session.user) {
    cartProducts = req.user.cart.items;
  }
  const productId = req.params.productID;
  Product.findById(productId)
    .then((product) => {
      res.render("../views/shop/product-detail.pug", {
        prod: product,
        cartProductIDs: cartProducts,
        title: "Product Details",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCartItems = (req, res, next) => {
  Product.find()
    .then((products) => {
      return (prdID = products.map((prds) => prds._id));
    })
    .then((productIDs) => {
      return req.user.getCart(productIDs);
    })
    .then((user) => {
      return user.populate("cart.items.productID").execPopulate();
    })
    .then((userWithPopulatedProduct) => {
      const products = userWithPopulatedProduct.cart.items;
      res.render("../views/shop/display-cart.pug", {
        cartItems: products,
        title: "Cart",
      });
    })
    .catch((err) => console.log(err));
};

exports.addCartItems = (req, res, next) => {
  const prodID = req.params.productID;
  Product.findById(prodID)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log("Added to cart");
      res.redirect("/");
    });
};

exports.deleteFromCart = (req, res, next) => {
  const prodID = req.params.productID;
  req.user.deleteFromCart(prodID).then(() => {
    console.log("Deleted from cart");
    res.redirect("/cart");
  });
};
