const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const path = require("path");
const User = require("../models/user");

router.get("/", (req, res) => {
  res.render("user/login", {});
});

router.post("/", (req, res) => {
  const { email, password } = req.body;
  let validation = {};
  let errors = [];
  let passed = true;

  if (!email) {
    validation.email = "Please enter a valid email address";
    passed = false;
  }
  if (!password) {
    validation.password = "Please enter your password";
    passed = false;
  }
  if (passed) {
    User.findOne({
      email: req.body.email,
    })
      .then((user) => {
        if (user === null) {
          console.log(`Error! Can not find email: ${err}`);
          errors.push("Sorry, your email was not found");
          res.render("user/login", {
            errors,
          });
        } else {
          bcrypt
            .compare(req.body.password, user.password)
            .then((isMatched) => {
              if (isMatched === true) {
                if (user.usertype === "user") {
                  req.session.user = user;
                  console.log("User logged in");
                  res.render("user/userDash", {
                    user: user,
                  });
                } else if (user.usertype === "admin") {
                  req.session.user = user;
                  console.log("Admin logged in");
                  res.redirect("/clerkDash");
                }
              } else {
                console.log("Error! Password does not match");
                errors.push("Sorry, your password does not match");
                res.render("user/login", {
                  errors,
                });
              }
            })
            .catch((err) => {
              console.log(`Error comparing passwords: ${err}`);
              errors.push("Comparing password error");
              res.render("user/login", {
                errors,
              });
            });
        }
      })
      .catch((err) => {
        console.log("Can not find the user from database");
        errors.push("ERROR! Can not find the user from database");
        res.render("user/login", {
          errors,
        });
      });
  } else {
    res.render("user/login", {
      validation: validation,
      values: req.body,
    });
  }
});

router.get("/logout", (req, res) => {
  console.log("User logged out!");
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
