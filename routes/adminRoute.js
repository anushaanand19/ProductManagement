const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAuth = require("../middleware/authMiddleware");
const { body } = require("express-validator");

router.get(
  "/edit-delete-product",
  isAuth,
  adminController.getEditAndDeleteProducts
);
router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", isAuth, adminController.postAddProduct);
router.post("/edit/:productID", isAuth, adminController.setEditProduct);
router.get("/edit/:productID", isAuth, adminController.getEditProduct);
router.get("/delete/:productID", isAuth, adminController.deleteProduct);
router.get("/product/delete/:productID", isAuth, adminController.deleteProduct);

module.exports = router;
