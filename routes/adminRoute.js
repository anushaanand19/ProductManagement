const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/", adminController.getMainAdminPage);
router.get("/edit-delete-product", adminController.getEditAndDeleteProducts);
router.get("/add-product", adminController.getAddProduct);
router.post("/products", adminController.getProducts);
router.post("/edit/:productID", adminController.setEditProduct);
router.get("/edit/:productID", adminController.getEditProduct);
router.get("/delete/:productID", adminController.deleteProduct);
router.get("/product/delete/:productID", adminController.deleteProduct);

module.exports = router;
