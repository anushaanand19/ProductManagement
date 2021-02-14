const express = require("express");
const shopController = require("../controllers/shopController");
const isAuth = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", shopController.getShopProducts);
router.get("/cart", isAuth, shopController.getCartItems);
router.get("/postcart/:productID", isAuth, shopController.addCartItems);
router.get("/product/:productID", shopController.getProductDetails);
router.get("/deleteFromCart/:productID", shopController.deleteFromCart);

module.exports = router;
