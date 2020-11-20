const express = require("express");
const router = express.Router();
const data = require("../data.json");
const User = require("../models/user");

function validateEmail(email) {
  const regular = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return regular.test(String(email).toLowerCase());
}

function validatePassword(password) {
  const regular = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  return regular.test(password);
}

router.get("/", (req, res) => {
  res.render("user/signup", {
    validation: {},
    values: {},
  });
});

router.post("/", (req, res) => {
  const { firstName, lastName, email, password, usertype } = req.body;
  const user = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    usertype: usertype,
  });
  const message = `Welcome ${firstName} !! We're glad to meet you! `;
  const message1 = `Welcome ${firstName} !`;
  let validation = {};
  let passed = true;

  if (!firstName || firstName.length < 2 || firstName.length > 20) {
    passed = false;
    validation.firstName = "First name must be 2 to 20";
  }

  if (!lastName || lastName.length < 2 || lastName.length > 20) {
    passed = false;
    validation.lastName = "Last name must be 2 to 20";
  }

  if (!validateEmail(email)) {
    passed = false;
    validation.email =
      "must start with number or character and also contain '@'";
  }

  if (!validatePassword(password)) {
    passed = false;
    validation.password =
      "must be 6 to 20 and at least one digit, uppercase, lowercase";
  }

  if (passed) {
    user
      .save()
      .then((userSaved) => {
        const key = process.env.Mail_key;
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(key);

        const msg = {
          to: `${email}`,
          from: "echoi26@myseneca.ca",
          subject: "Contact Us Form Submission",
          html: `Vistor's Full Name: ${userSaved.firstName} ${userSaved.lastName}<br>
                    Vistor's Email Address: ${userSaved.email}<br>
                    Vistor's message: ${userSaved.message}<br>
                    `,
        };
        user.updateOne({
          _id: userSaved._id,
        });
        // Asyncronously sends the email message.
        sgMail
          .send(msg)
          .then(() => {
            res.render("user/welcome", {
              values: req.body,
            });
          })
          .catch((err) => {
            console.log(`Error ${err}`);

            res.render("user/signup", {
              title: "Contact Us Page",
              validation: validation,
              values: req.body,
            });
          });
        console.log(`${userSaved.firstName} has been saved to the database`);
      })
      .catch((err) => {
        console.log("Error");
        console.log(err);
      });
  } else {
    res.render("user/signup", {
      title: "Contact Us Page",
      validation: validation,
      values: req.body,
    });
  }
});

module.exports = router;
