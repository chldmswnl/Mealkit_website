const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const expressHbs = require("express-handlebars");

var hbs = expressHbs.create({});
hbs.handlebars.registerHelper("getTotal", function (value1, value2) {
  return value1 * value2;
});

function ensureUser(req, res, next) {
  if (req.session.user) {
    if (req.session.user.usertype === "user") {
      next();
    }
  } else {
    res.redirect("/");
  }
}

router.get("/", ensureUser, (req, res) => {
  res.render("user/userDash");
});

router.get("/cart", ensureUser, (req, res) => {
  Cart.find()
    .exec()
    .then((cart) => {
      let total_quan = 0;
      let total_price = 0;

      cart = cart.map((value) => value.toObject());

      for (let i = 0; i < cart.length; i++) {
        total_quan += cart[i].quantity;
        total_price += cart[i].price * cart[i].quantity;
      }

      res.render("user/shoppingCart", {
        data: cart,
        total_quan: total_quan,
        total_price: total_price,
      });
    });
});

router.post("/cart", ensureUser, (req, res) => {
  let message = [];
  Cart.find()
    .exec()
    .then((cart) => {
      cart = cart.map((value) => value.toObject());

      if (cart.length === 0) {
        message.push("Shopping cart is empty!");
        res.render("user/shoppingCart", {
          msg: message,
        });
      } else {
        const key = process.env.Mail_key;
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(key);

        let order_info = "";
        let total = 0;
        for (let i = 0; i < cart.length; i++) {
          order_info += `Name: ${cart[i].title} / Qty: ${cart[i].quantity} <br>`;
          total += cart[i].price * cart[i].quantity;
        }
        const msg = {
          to: `${req.session.user.email}`,
          from: "echoi26@myseneca.ca",
          subject: "Order information",
          html: `User's Full Name: ${req.session.user.firstName} ${req.session.user.lastName} <br>
                        User's Email Address: ${req.session.user.email}<br>
                        Order total price: $${total}<br>
                        Order information:<br> ${order_info}
                        `,
        };
        sgMail
          .send(msg)
          .then(async () => {
            await Cart.deleteMany({});
            message.push("Your order is being processed!");
            res.render("user/shoppingCart", {
              msg: message,
            });
          })
          .catch((err) => {
            console.log(`Error ${err}`);
            res.render("user/shoppingCart", {
              data: cart,
            });
          });
      }
    });
});

module.exports = router;
