const express = require("express");
const router = express.Router();
const data = require("../data.json");

router.get("/", (req, res) => {
  res.render("general/home", {
    data: data.meals,
    title: "Home Page",
  });
});

router.get("/menu", (req, res) => {
  res.render("general/menu", {
    data: data.meals,
  });
});

router.get("/userDash", (req, res) => {
  if (req.session.user == null) {
    res.redirect("/");
  } else {
    res.render("user/userDash");
  }
});

router.get("/clerkDash", (req, res) => {
  if (req.session.user == null) {
    res.redirect("/");
  } else {
    res.render("user/clerkDash");
  }
});

module.exports = router;
