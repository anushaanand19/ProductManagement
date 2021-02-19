const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: { type: String },
  resetTokenExpiration: { type: Date },
  cart: {
    items: [
      {
        productID: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productID.toString() === product._id.toString();
  });
  let updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    updatedCartItems[cartProductIndex].quantity++;
  } else {
    updatedCartItems.push({ productID: product, quantity: 1 });
  }
  this.cart = { items: updatedCartItems };
  return this.save();
};

userSchema.methods.getCart = function (productIDs) {
  let cartItems = this.cart.items;
  let updatedCartItems = cartItems.filter((cp) => {
    return productIDs.toString().includes(cp.productID.toString());
  });
  this.cart.items = updatedCartItems;
  return this.save();
};

userSchema.methods.deleteFromCart = function (prodID) {
  let cartItems = this.cart.items,
    newQuantity = 1;
  let cartPrdIndex = cartItems.findIndex((cp) => {
    return cp.productID.toString() === prodID.toString();
  });
  if (cartItems[cartPrdIndex].quantity > 1) {
    cartItems[cartPrdIndex].quantity--;
  } else {
    cartItems.splice(cartPrdIndex, 1);
  }
  this.cart.items = cartItems;
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
