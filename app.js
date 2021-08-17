const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");

require("dotenv").config();

// Local packages
const { passportConfig, passport } = require("./configs/passport-config");
const userRoutes = require("./routes/userRoutes");
const carRoutes = require("./routes/carRoutes");
const adminRoutes = require("./routes/adminRoutes");
const rentRoutes = require("./routes/rentRoutes");
const mainApp = require(__dirname + "/utility/main");
const HttpError = require("./models/http-error");
const Car = require("./models/car");

const app = express();

app.use(
  session({
    secret: process.env.APP_SECRET || "123xyz",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");

app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "100mb",
    extended: false,
    parameterLimit: 500000,
  })
);

app.use(express.static("public"));

// Configure passport
passportConfig(app);

// 								===========================
// 								===========================
// 									 Routes section
// 								===========================
// 								===========================

app.get("/", async function (req, res) {
  let cars = await mainApp.getAllDocs(Car);

  if (req.isAuthenticated()) {
    let user = await mainApp.processUser(req.user);
    let homePack = {
      cars: cars,
      user: user,
      auth: true,
    };
    res.render("home", homePack);
  } else {
    let homePack = {
      cars: cars,
      auth: false,
    };
    res.render("home", homePack);
  }
});

app.use("/", userRoutes);
app.use("/", carRoutes);
app.use("/", adminRoutes);
app.use("/", rentRoutes);

// Error for non-existing route
app.use((req, res, next) => {
  const error = new HttpError("This route doesn't exist.", 404);
  throw error;
});

// Middlware for error handling
app.use((err, req, res, next) => {
  if (res.headerSent) {
    return next(err);
  }

  let code = err.code || 500;
  let message = err.message || "Oops, an unknown error occured.";
  res.render("error", { message, code });
});

// Please apply your mongo key here
mongoose
  .connect(process.env.MONGO_KEY, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to DB successfully.");
    let port = process.env.PORT;
    if (port == null || port == "") {
      port = 8888;
    }

    app.listen(port, function () {
      console.log("Server is up and running");
    });
  })
  .catch((e) => {
    console.log("Failed to connect DB.");
    console.log(e);
  });
