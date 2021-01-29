const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/login", authController.getlogin);
router.post("/login", authController.postLogin);
router.get("/signup", authController.getSignUp);
router.post("/signup", authController.postSignUp);
router.post("/logout", authController.postLogout);
module.exports = router;
