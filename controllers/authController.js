const User = require("../model/user");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");

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
  const userEmail = req.body.email;
  const pwd = req.body.password;
  User.findOne({ email: userEmail })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email. Please try again");
        return res.redirect("/login");
      }
      bcrypt.compare(pwd, user.password).then((result) => {
        if (result) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        } else {
          req.flash("error", "Invalid password. Please try again");
          res.redirect("/login");
        }
      });
    })
    .catch((err) => console.log(err));
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
  const confirmedPwd = req.body.confirmedPwd;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash(
          "error",
          "Email exists already. Please pick a different one."
        );
        res.redirect("/signup");
      }
      return bcrypt.hash(pwd, 10);
    })
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
        user.resetTokenExpiration = Date.now() + 360000;
        return user.save();
      })
      .then((result) => {
        transporter.sendMail({
          to: userEmail,
          from: "shopProducts@gmail.com",
          subject: "Password Reset",
          html: `<p> Hi! You have requested to reset your password.
          Please click <a href = "${process.env.BASE_URL}password-reset/${token}"> here </a></p>`,
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

exports.getPwdToken = (req, res, next) => {
  console.log(req.params.token);
  User.findOne({ resetToken: req.params.token })
    .then((user) => {
      console.log(user);
    })
    .catch((err) => console.log(err));
};
