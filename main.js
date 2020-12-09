const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

//DB setting

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection; // db object

db.once("open", function () {
  console.log("DB connected");
});

db.on("error", function (err) {
  console.log("DB ERROR: ", err);
});

//Set up handlebars
app.engine(
  ".hbs",
  exhbs({
    extname: ".hbs",
    defaultLayout: "main",
    runtimeOptions: {
      allowProtoPropertiesByDefault: true,
      allowProtoMethodsByDefault: true,
    },
  })
);
app.set("view engine", ".hbs");
app.use(express.static(path.join(__dirname, "public")));

//Set up body parser
app.use(bodyParser.urlencoded({ extended: false }));

// Set up express-session
app.use(
  session({
    secret: process.env.Session,
    resave: false,
    saveUninitialized: true,
  })
);

// Set up express-fileupload
app.use(fileUpload());

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Load Controllers
const generalController = require("./controllers/general");
const loginController = require("./controllers/login");
const signupController = require("./controllers/signup");
const mealController = require("./controllers/meal.js");
const cartController = require("./controllers/cart");

app.use("/signup", signupController);
app.use("/", generalController);
app.use("/login", loginController);
app.use("/clerkDash", mealController);
app.use("/userDash", cartController);

const HTTP_PORT = process.env.PORT;

app.listen(HTTP_PORT, () => {
  console.log("Express http server listening on: " + HTTP_PORT);
});
