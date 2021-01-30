const User = require("../model/user");
const bcrypt = require("bcryptjs");
var saltRounds = 10;

exports.getlogin = (req, res, next) => {
  req.session.isLoggedIn = false;
  req.session.user = null;
  res.render("../views/auth/login.pug", {
    title: "Login",
    loggedIn: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  const userEmail = req.body.email;
  const pwd = req.body.password;
  User.findOne({ email: userEmail })
    .then((user) => {
      if (!user) {
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
    loggedIn: req.session.isLoggedIn,
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
        res.redirect("/signup");
      }
      return bcrypt.hash(pwd, saltRounds);
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
    .then((result) => res.redirect("/login"))
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("If any error found in Logout", err);
    res.redirect("/");
  });
};
