const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
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

userSchema.methods.getCart = function () {
  return this.cart.items;
};

userSchema.methods.deleteFromCart = function (prodID) {};
userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
