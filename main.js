const express = require("express");
const exhbs = require("express-handlebars");
const path = require("path");
const data = require("./data.json");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");

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

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Load Controllers
const generalController = require("./controllers/general");
const loginController = require("./controllers/login");
const signupController = require("./controllers/signup");

app.use("/signup", signupController);
app.use("/", generalController);
app.use("/login", loginController);

const HTTP_PORT = process.env.PORT;

app.listen(HTTP_PORT, () => {
  console.log("Express http server listening on: " + HTTP_PORT);
});
