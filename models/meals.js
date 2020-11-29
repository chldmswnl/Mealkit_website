const mongoose = require("mongoose");
const meals = require("../data");
const Schema = mongoose.Schema;

// schema
const mealSchema = new Schema({
  img: { type: String },
  title: { type: String, requried: true },
  included: { type: String, required: true },
  desc: { type: String, required: true },
  category: { type: String, required: true },
  serving: { type: Number, required: true },
  calroriesPerServing: { type: Number, required: true },
  isAsia: { type: Boolean, default: false },
  isWestern: { type: Boolean, default: false },
  topmeal: { type: Boolean, default: false },
  cookingTime: { type: Number, required: true },
  price: { type: String, required: true },
});

const Meal = mongoose.model("meal", mealSchema);

Meal.find().count({}, (err, count) => {
  if (count === 0) {
    Meal.insertMany(meals);
  } else {
    console.log("Data is already loaded");
  }
});

module.exports = Meal;
