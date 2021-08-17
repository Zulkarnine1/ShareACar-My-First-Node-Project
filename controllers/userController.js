const { model } = require("../models/user");
const { passport } = require("../configs/passport-config");
const mainApp = require("../utility/main");
const cloudinary = require("../utility/cloudinary");
const Rent = require("../models/rent");
const Car = require("../models/car");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const signUpApp = require("../utility/signup");

const accountPageController = async function (req, res) {
  let rents = [];
  let cars = [];
  let user = await mainApp.processUser(req.user);

  for (let i = 0; i < req.user.rents.length; i++) {
    let rentID = req.user.rents[i];
    let rent = await mainApp.getOneDoc(Rent, rentID);
    rents.push(rent);
  }

  for (let i = 0; i < req.user.rents.length; i++) {
    let carID = rents[i].car;
    let car = await mainApp.getOneDoc(Car, carID);

    cars.push(car);
  }

  let accountPack = {
    user: user,
    user1: req.user,
    auth: true,
    rents: rents,
    cars: cars,
  };
  res.render("userAcc", accountPack);
};

const editAccountPageHandler = function (req, res) {
  let accountPack = {
    user: req.user,
    auth: true,
  };
  res.render("editAcc", accountPack);
};

// Authentication routes

const getSignIn = function (req, res) {
  res.render("signin");
};

const getSignUp = function (req, res) {
  res.render("signup");
};

const signout = function (req, res) {
  req.logout();
  res.redirect("/");
};

const postSignIn = async function (req, res, next) {
  try {
    const username = req.body.username;
    const user = await User.findOne({ username });

    if (!user) return next(new HttpError("Invalid Credentials please try again", 422));

    req.login(user, function (err, user) {
      if (err) {
        return next(new HttpError("Signing in failed due to internal server error.", 500));
      } else {
        passport.authenticate("local", (err, user) => {
          if (!user) return next(new HttpError("Invalid Credentials please try again", 422));

          if (req.user.admin === true) {
            return res.redirect("/adminhome");
          } else {
            return res.redirect("/");
          }
        })(req, res, next);
      }
    });
  } catch (error) {
    console.log(error);
    const err = new HttpError("Signing in failed due to internal server error.", 500);
    return next(err);
  }
};

const postSignUp = async function (req, res, next) {
  try {
    let ageVer = await signUpApp.checkAge(req.body.dob);
    if (ageVer == false) {
      return next(new HttpError("Age less than 18 years not allowed", 422));
    } else {
      User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
          console.log(err);
          return next(new HttpError("Email already taken, sign up using other email address or sign in.", 422));
        } else {
          passport.authenticate("local")(req, res, function () {
            let query = { username: req.body.username };
            let update = {
              name: req.body.name + " ",
              email: req.body.username,
              profileImg: "https://media.publit.io/file/Sokogate/Sokogate/12055105.jpg",
              mobileNum: req.body.userMobile,
              dateofbirth: req.body.dob,
              credit: 100000,
              admin: false,
              ver: false,
              rents: [],
            };
            User.findOneAndUpdate(query, update, function (err, result) {
              if (err) {
                console.log(err);
              } else {
              }
            }).then(res.redirect("/"));
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
    const err = new HttpError("Signing up failed due to internal server error.", 500);
    return next(err);
  }
};

const postUserEditAcc = async function (req, res, next) {
  try {
    if (req.user.id.toString() === req.params.userID) {
      let user = await User.findById(req.user.id);
      var edition = JSON.parse(req.body.package);
      let name;
      let mNum;
      let profileImg;
      let license;
      //accept profile img
      if (!(edition.img1 == "")) {
        let pack2 = {
          folder: "shareCarTemp/Profile",
        };
        let cloudRes = await cloudinary.uploadFile(edition.img1, pack2);
        profileImg = cloudRes.data.url;
      } else {
        profileImg = user.profileImg;
      }
      //accept license img
      if (!(edition.img2 == "")) {
        let pack3 = {
          folder: "shareCarTemp/License",
        };
        let cloudRes1 = await cloudinary.uploadFile(edition.img2, pack3);
        license = cloudRes1.data.url;
      } else {
        license = user.license;
      }

      //accept name

      if (!(edition.name == "")) {
        name = edition.name;
      } else {
        name = user.name;
      }

      //accept number

      if (!(edition.mobileNum == "")) {
        mNum = edition.mobileNum;
      } else {
        mNum = user.mobileNum;
      }

      user.name = name;
      user.mobileNum = mNum;
      user.profileImg = profileImg;
      user.license = license;
      await user.save();
      if (user.license !== undefined) {
        res.send("/account");
      } else {
        res.send(false);
      }
    } else {
      return next("Unauthorized action, you don't have access to updating this users data.", 500);
    }
  } catch (error) {
    console.log(error);
    const err = new HttpError("Updating user profile failed due to internal server error.", 500);
    return next(err);
  }
};

exports.accountPageController = accountPageController;
exports.editAccountPageHandler = editAccountPageHandler;
exports.getSignIn = getSignIn;
exports.getSignUp = getSignUp;
exports.signout = signout;
exports.postSignIn = postSignIn;
exports.postSignUp = postSignUp;
exports.postUserEditAcc = postUserEditAcc;
