const express = require("express");
const router = express.Router();
const path = require("path");
const Meal = require("../models/meals");

router.get("/", (req, res) => {
  if (req.session.user == null) {
    res.redirect("/");
  } else {
    res.render("user/clerkDash");
  }
});

router.get("/createmeal", (req, res) => {
  if (req.session.user == null) {
    res.redirect("/");
  } else {
    res.render("user/createMeal");
  }
});

router.post("/createmeal", (req, res) => {
  const {
    title,
    included,
    desc,
    mealtype,
    kit_price,
    kit_time,
    kit_serving,
    kit_calories,
    topmeal,
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

  if (topmeal === "Yes") {
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

router.get("/editmeal", (req, res) => {
  if (req.session.user == null) {
    res.redirect("/");
  } else {
    Meal.find()
      .exec()
      .then((meal) => {
        data = meal.map((value) => value.toObject());

        res.render("user/mealList", {
          data: data,
        });
      });
  }
});

router.get("/editmeal/:id", (req, res) => {
  if (req.session.user == null) {
    res.redirect("/");
  } else {
    Meal.findOne({ _id: req.params.id }, (err, meal) => {
      if (err) return res.json(err);
      res.render("user/editMeal", { values: meal });
    });
  }
});

router.post("/editmeal/:id", (req, res) => {
  Meal.findOne({ _id: req.params.id }).exec((err, meal) => {
    if (err) return res.json(err);

    meal.title = req.body.title;
    meal.included = req.body.included;
    meal.desc = req.body.desc;
    meal.category = req.body.mealtype;
    meal.serving = req.body.kit_serving;
    meal.calroriesPerServing = req.body.kit_calories;
    if (meal.price != req.body.kit_price) {
      meal.price = `$${req.body.kit_price}`;
    } else {
      meal.price = req.body.kit_price;
    }

    meal.cookingTime = req.body.kit_time;

    if (req.body.mealtype === "asia") {
      meal.isAsia = true;
      meal.isWestern = false;
    } else if (req.body.mealtype === "western") {
      meal.isWestern = true;
      meal.isAsia = false;
    }

    if (req.body.top === "Yes") {
      Meal.updateOne(
        {
          _id: meal._id,
        },
        {
          topmeal: true,
        }
      );
    } else if (req.body.top === "No");
    {
      Meal.updateOne(
        {
          _id: meal._id,
        },
        {
          topmeal: false,
        }
      );
    }

    meal.save((err, meal) => {
      if (err) return res.json(err);

      if (req.files) {
        req.files.kit_picture.name = `pro_pic_${meal._id}${
          path.parse(req.files.kit_picture.name).ext
        }`;

        req.files.kit_picture
          .mv(`public/uploads/${req.files.kit_picture.name}`)
          .then(() => {
            console.log(req.files.kit_picture.name);
            Meal.updateOne(
              {
                _id: meal._id,
              },
              {
                img: req.files.kit_picture.name,
              }
            ).then(() => {});
          });
      }
      res.redirect("/clerkDash/editmeal");
      console.log("Success");
    });
  });
});

module.exports = router;
