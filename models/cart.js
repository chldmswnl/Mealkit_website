const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  img: { type: String, required: true },
  title: { type: String, required: true },
  quantity: { type: Number, requried: true },
  price: { type: Number, requried: true },
});

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
