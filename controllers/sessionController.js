const User = require("../models/User");
const parseVErr = require("../utils/parseValidationErrs");
const csrf = require("host-csrf");

const registerShow = (req, res) => {
  res.render("register");
};

//  check if the two passwords the user entered match, and refresh the page otherwise.
//  If all is good there, it will create a user in the database and redirect to the home page. 
const registerDo = async (req, res, next) => {
  if (req.body.password != req.body.password1) {
    req.flash("error", "The passwords entered do not match.");
    res.render("register", {errors: req.flash.errors});
  }
  try {
    await User.create(req.body);
  } catch (e) {
    if (e.constructor.name === "ValidationError") {
      parseVErr(e, req);
    } else if (e.name === "MongoServerError" && e.code === 11000) {
      req.flash("error", "That email address is already registered.");
    } else {
      return next(e);
    }
    return res.render("register", {errors: req.flash.errors});
  }
  res.redirect("/");
};

const logoff = (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    }    
    res.redirect("/");
  });
};

const logonShow = (req, res) => {
  if (req.user) {
    csrf.refresh(req,res);
    return res.redirect("/");
  }
  res.render("logon");
};

module.exports = {
  registerShow,
  registerDo,
  logoff,
  logonShow,
};