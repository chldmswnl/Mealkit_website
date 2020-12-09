const express = require("express");
const router = express.Router();
const Meal = require("../models/meals");
const Cart = require("../models/cart");

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

router.get("/menu/:id", (req, res) => {
  Meal.findOne({ _id: req.params.id }, (err, meal) => {
    if (err) return res.json(err);
    res.render("user/desc", { data: meal });
  });
});

router.post("/menu/:id", async (req, res) => {
  const findMeal = await Meal.findOne({ _id: req.params.id });
  let msg = [];

  if (req.session.user) {
    if (req.session.user.isUser) {
      const { quan } = req.body;
      const findCart = await Cart.findOne({ title: findMeal.title });
      let new_price = parseInt(findMeal.price.slice(1));

      if (quan <= 0) {
        msg.push("Quantity should be greater than 0");
        res.render("user/desc", {
          data: findMeal,
          msg: msg,
        });
      } else {
        msg.push("Your meal kit is successfully added!");
        if (findCart === null) {
          var cart = new Cart({
            title: findMeal.title,
            img: findMeal.img,
            price: new_price,
            quantity: quan,
          });

          cart.save().then(() => {
            console.log(cart);
            console.log("Add new meal");
            res.render("user/desc", {
              data: findMeal,
              msg,
            });
          });
        } else {
          let new_quan = parseInt(findCart.quantity) + parseInt(quan);
          await findCart.updateOne({ quantity: new_quan });
          console.log("Add number");
          res.render("user/desc", {
            data: findMeal,
            msg,
          });
        }
      }
    }
  } else {
    msg.push("Only user can add meal kit(s)!");
    res.render("user/desc", {
      data: findMeal,
      msg,
    });
  }
});

module.exports = router;
