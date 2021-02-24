const User = require("../model/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoDB = require("mongodb");
const { validationResult } = require("express-validator");
const saltRounds = 10;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: `${process.env.EMAIL_USER}`,
    pass: `${process.env.EMAIL_PASSWORD}`,
  },
});

exports.getlogin = (req, res, next) => {
  req.session.isLoggedIn = false;
  req.session.user = null;
  res.render("../views/auth/login.pug", {
    title: "Login",
  });
};

exports.postLogin = (req, res, next) => {
  const pwd = req.body.password;
  var userFound;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        throw "Invalid email";
      }
      userFound = user;
      return bcrypt.compare(pwd, user.password);
    })
    .then((result) => {
      if (result) {
        req.session.save(() => {
          req.session.isLoggedIn = true;
          req.session.user = userFound;
          return res.redirect("/");
        });
      } else {
        throw "Invalid Password";
      }
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", err);
      res.redirect("/login");
    });
};

exports.getSignUp = (req, res, next) => {
  req.session.isLoggedIn = false;
  req.session.user = null;
  res.render("../views/auth/signup.pug", {
    title: "SignUp",
  });
};

exports.postSignUp = (req, res, next) => {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const pwd = req.body.password;
  const err = validationResult(req);
  if (!err.isEmpty()) {
    const errors = err.errors[0].msg;
    req.flash("error", errors);
    return res.redirect("/signup");
  }
  bcrypt
    .hash(pwd, saltRounds)
    .then((hashedPwd) => {
      const user = new User({
        name: firstName + " " + lastName,
        email: email,
        password: hashedPwd,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "shopProducts@gmail.com",
        subject: "SignUp successful",
        html: "<h1> Hi! Welcome to our page. Happy shopping</h1>",
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("If any error found in Logout", err);
    res.redirect("/");
  });
};

exports.getResetPwd = (req, res, next) => {
  res.render("../views/auth/reset-password.pug", {
    title: "Reset Password",
  });
};

exports.postResetPwd = (req, res, next) => {
  const userEmail = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset-password");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: userEmail })
      .then((user) => {
        if (!user) {
          throw "This email does not exist, please enter a valid email ID";
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        transporter.sendMail({
          to: userEmail,
          from: "shopProducts@gmail.com",
          subject: "Password Reset",
          html: `<p> Hi! You have requested to reset your password.
          Please click <a href = "${process.env.BASE_URL}new-password/${token}"> here </a></p>`,
        });
      })
      .then((sentEmail) => {
        console.log("email sent");
        req.flash(
          "information",
          `An email has been sent to the registered email ID. 
          Please follow the steps in the email to reset the password`
        );
        res.redirect("/reset-password");
      })
      .catch((err) => {
        console.log(err);
        req.flash("error", err);
        res.redirect("/reset-password");
      });
  });
};

exports.getNewPwd = (req, res, next) => {
  User.findOne({
    resetToken: req.params.token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        throw "An unexpected problem occured. Please try again";
      }
      const userID = user._id.toString();
      res.render("../views/auth/new-password.pug", {
        title: "Set Password",
        userID: userID,
        token: req.params.token,
      });
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", err);
      res.redirect("/login");
    });
};

exports.postNewPwd = (req, res, next) => {
  const token = req.body.token;
  const userID = req.body.userID;
  const password = req.body.password;
  const confirmedPwd = req.body.confirmedPwd;
  if (password !== confirmedPwd) {
    req.flash("error", "Password's dont match. Please check again");
    return res.redirect(`/new-password/${token}`);
  }
  bcrypt
    .hash(password, 10)
    .then((hashedPwd) => {
      return User.findOne(
        { resetToken: token },
        { _id: new mongoDB.ObjectID(userID) }
      ).then((user) => {
        user.password = hashedPwd;

        return user.save();
      });
    })
    .then((result) => {
      req.flash("information", "Please login again");
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      req.flash("error", err);
      res.redirect(`/new-password/${token}`);
    });
};
