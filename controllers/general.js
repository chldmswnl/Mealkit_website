const express = require("express");
const router = express.Router();
const Meal = require("../models/meals");

router.get("/", (req, res) => {
  Meal.find()
    .exec()
    .then((meal) => {
      data = meal.map((value) => value.toObject());

      res.render("general/home", {
        data: data,
        title: "Home Page",
      });
    });
});

router.get("/menu", (req, res) => {
  Meal.find()
    .exec()
    .then((meal) => {
      data = meal.map((value) => value.toObject());
      res.render("general/menu", {
        data: data,
      });
    });
});

router.get("/userDash", (req, res) => {
  if (req.session.user == null) {
    res.redirect("/");
  } else {
    res.render("user/userDash");
  }
});

module.exports = router;
