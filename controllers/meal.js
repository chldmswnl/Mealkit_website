const express = require("express");
const router = express.Router();
const path = require("path");
const Meal = require("../models/meals");

function ensureAdmin(req, res, next) {
  if (req.session.user) {
    if (req.session.user.usertype === "admin") {
      next();
    }
  } else {
    res.redirect("/");
  }
}

router.get("/", ensureAdmin, (req, res) => {
  res.render("user/clerkDash");
});

router.get("/createmeal", ensureAdmin, (req, res) => {
  res.render("user/createMeal");
});

router.post("/createmeal", ensureAdmin, (req, res) => {
  const {
    title,
    included,
    desc,
    mealtype,
    kit_price,
    kit_time,
    kit_serving,
    kit_calories,
    top,
    kit_picture,
  } = req.body;

  var meal = new Meal({
    title: title,
    included: included,
    desc: desc,
    category: mealtype,
    serving: kit_serving,
    calroriesPerServing: kit_calories,
    price: `$${kit_price}`,
    cookingTime: kit_time,
  });

  if (mealtype === "asia") {
    meal.isAsia = true;
  } else if (mealtype === "western") {
    meal.isWestern = true;
  }

  if (top === "Yes") {
    meal.topmeal = true;
  }
  console.log(kit_picture);
  meal
    .save()
    .then((mealSaved) => {
      req.files.kit_picture.name = `pro_pic_${mealSaved._id}${
        path.parse(req.files.kit_picture.name).ext
      }`;

      req.files.kit_picture
        .mv(`public/uploads/${req.files.kit_picture.name}`)
        .then(() => {
          Meal.updateOne(
            {
              _id: mealSaved._id,
            },
            {
              img: req.files.kit_picture.name,
            }
          ).then(() => {});
        });

      res.redirect("/clerkDash");
      console.log("Success");
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/editmeal", ensureAdmin, (req, res) => {
  Meal.find()
    .exec()
    .then((meal) => {
      data = meal.map((value) => value.toObject());

      res.render("user/mealList", {
        data: data,
      });
    });
});

router.get("/editmeal/:id", ensureAdmin, (req, res) => {
  Meal.findOne({ _id: req.params.id }, (err, meal) => {
    if (err) return res.json(err);
    res.render("user/editMeal", { values: meal });
  });
});

router.post("/editmeal/:id", ensureAdmin, async (req, res) => {
  let {
    title,
    included,
    desc,
    mealtype,
    kit_price,
    kit_time,
    kit_serving,
    kit_calories,
    top,
  } = req.body;

  const findMeal = await Meal.findOne({ _id: req.params.id });

  if (req.files) {
    req.files.kit_picture.name = `pro_pic_${findMeal._id}${
      path.parse(req.files.kit_picture.name).ext
    }`;

    req.files.kit_picture
      .mv(`public/uploads/${req.files.kit_picture.name}`)
      .then(() => {
        console.log(req.files.kit_picture.name);
        findMeal
          .updateOne({
            img: req.files.kit_picture.name,
          })
          .then(() => {});
      });
  }
  if (findMeal.price !== kit_price) {
    kit_price = `$${kit_price}`;
  }
  await findMeal.updateOne({
    title: title,
    included: included,
    desc: desc,
    category: mealtype,
    isAsia: mealtype === "asia",
    isWestern: mealtype === "western",
    serving: kit_serving,
    calroriesPerServing: kit_calories,
    cookingTime: kit_time,
    price: kit_price,
    topmeal: top === "Yes",
  });

  res.redirect("/clerkDash/editmeal");
  console.log("Success");
});

module.exports = router;
