const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const adminRouter = require("./routes/adminRoute");
const shopRouter = require("./routes/shopRoute");
const authRouter = require("./routes/authRoute");
const mongoose = require("mongoose");
const mongodb = require("mongodb");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);
const User = require("./model/user");
require("dotenv").config();

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/shop?authSource=admin&replicaSet=Cluster0-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&ssl=true`;

const store = new mongoDBStore({
  uri: MONGODB_URI,
  collection: "session",
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret key",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use((req, res, next) => {
  if (req.session.user) {
    User.findById(req.session.user._id)
      .then((user) => {
        req.user = user;
        next();
      })
      .catch((err) => console.log(err));
  } else {
    next();
  }
});
app.set("view engine", "pug");
app.set("views", "views");
app.use(authRouter);
app.use("/admin", adminRouter);
app.use(shopRouter);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((res) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
