const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const User = require("../model/user");

router.get("/login", authController.getlogin);
router.post(
  "/login",
  body("email").custom((value) => {
    return User.findOne({ email: value }).then((user) => {
      if (!user) {
        return Promise.reject("Invalid email, please check again");
      } else {
        return true;
      }
    });
  }),
  authController.postLogin
);
router.get("/signup", authController.getSignUp);
router.post(
  "/signup",
  [
    body("email", "Invalid email")
      .isEmail()
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "Email already exists. Please pick a different one"
            );
          } else {
            return true;
          }
        });
      }),
    body(
      "password",
      "The password should be more than 8 characters & alphanumeric"
    )
      .isLength({ min: 8, max: 16 })
      .isAlphanumeric(),
    body("confirmedPwd").custom((value, { req }) => {
      if (value !== req.body.password) {
        return Promise.reject("Passwords dont match. Please check again");
      } else {
        return true;
      }
    }),
  ],
  authController.postSignUp
);
router.post("/logout", authController.postLogout);
router.get("/reset-password", authController.getResetPwd);
router.post("/reset-password", authController.postResetPwd);
router.get("/new-password/:token", authController.getNewPwd);
router.post("/new-password", authController.postNewPwd);
module.exports = router;
