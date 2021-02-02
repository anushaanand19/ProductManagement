const mongoDB = require("mongodb");
const Product = require("../model/product");

exports.getMainAdminPage = (req, res, next) => {
  res.render("../views/admin/main-admin.pug", {
    title: "Admin Page",
    
  });
};

exports.getEditAndDeleteProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("../views/admin/edit-delete.pug", {
        products: products,
        title: "Edit products",
      
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
  const prodID = req.params.productID;
  Product.findById({ _id: new mongoDB.ObjectID(prodID) }).then((product) => {
    res.render("../views/admin/edit-product.pug", {
      title: "Edit Product",
      prod: product,
      
    });
  });
};

exports.getAddProduct = (req, res, next) => {
  res.render("../views/admin/add-product.pug", {
    title: "Admin Page",
    
  });
};

exports.getProducts = (req, res, next) => {
  const title = req.body.title;
  const author = req.body.author;
  const price = req.body.price;
  const image = req.body.image;
  const description = req.body.description;
  const userID = req.user;
  const product = new Product({
    title: title,
    price: price,
    author: author,
    imageURL: image,
    description: description,
    userID: userID,
  });
  product
    .save()
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.setEditProduct = (req, res, next) => {
  const title = req.body.title;
  const author = req.body.author;
  const price = req.body.price;
  const id = req.body.id;
  const imageURL = req.body.image;
  const description = req.body.description;
  const userID = req.user;
  Product.findById(id)
    .then((product) => {
      product.title = title;
      product.price = price;
      product.author = author;
      product.description = description;
      product.imageURL = imageURL;
      product.userID = userID;
      return product.save();
    })
    .then((result) => {
      console.log("Updated product");
      res.redirect("/admin/edit-delete-product");
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodID = req.params.productID;
  Product.deleteOne({ _id: new mongoDB.ObjectID(prodID) }).then(() => {
    res.redirect("/admin/edit-delete-product");
  });
};
