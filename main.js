const HTTP_PORT = process.env.PORT || 35491;
const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
const data = require("./data");
const bodyParser = require("body-parser");

const app = express();

app.engine(".hbs", exhbs({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

function validateEmail(email) {
  const regular = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return regular.test(String(email).toLowerCase());
}

function validatePassword(password) {
  const regular = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;
  return regular.test(password);
}

app.get("/menu", (req, res) => {
  res.render("menu", {
    data: data.meals,
  });
});

app.get("/login", (req, res) => {
  res.render("login", {});
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  let validation = {};
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
    res.redirect("/");
  } else {
    res.render("login", {
      validation: validation,
      values: req.body,
    });
  }
});

app.get("/signup", (req, res) => {
  res.render("signup", {
    validation: {},
    values: {},
  });
});

app.post("/signup", (req, res) => {
  const { firstName, lastName, email, password } = req.body;
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
    const key =
      "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";
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(key);

    const msg = {
      to: `${email}`,
      from: "echoi26@myseneca.ca",
      subject: "Contact Us Form Submission",
      html: `Vistor's Full Name: ${firstName} ${lastName}<br>
                Vistor's Email Address: ${email}<br>
                Vistor's message: ${message}<br>
                `,
    };

    // Asyncronously sends the email message.
    sgMail
      .send(msg)
      .then(() => {
        res.render("welcome", {
          values: req.body,
        });
      })
      .catch((err) => {
        console.log(`Error ${err}`);

        res.render("signup", {
          title: "Contact Us Page",
          validation: validation,
          values: req.body,
        });
      });
  } else {
    res.render("signup", {
      title: "Contact Us Page",
      validation: validation,
      values: req.body,
    });
  }
});

app.get("/", (req, res) => {
  console.log("root route");
  res.render("home", {
    data: data.meals,
  });
});

app.listen(HTTP_PORT, () => {
  console.log("Express http server listening on: " + HTTP_PORT);
});
