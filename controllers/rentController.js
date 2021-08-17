const HttpError = require("../models/http-error");
const mainApp = require("../utility/main");
const cloudinary = require("../utility/cloudinary");
const Car = require("../models/car");
const User = require("../models/user");
const Rent = require("../models/rent");

const myrents = async function (req, res, next) {
  try {
    let user = await mainApp.processUser(req.user);
    let rents = [];
    let cars = [];

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
      auth: true,
      rents: rents,
      cars: cars,
    };
    res.render("rentsUser", accountPack);
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const rentProcess1 = async function (req, res, next) {
  try {
    let car = await mainApp.getOneDoc(Car, req.params.carID);
    let parsedData = JSON.parse(req.body.data);
    let rentTime = Number(parsedData.rentTime);
    let cost = rentTime * car.price;
    if (req.isAuthenticated()) {
      if (rentTime < 1 || rentTime > 200 || !Number.isInteger(rentTime)) {
        res.send("con1");
      } else if (req.user.ver == false) {
        res.send("con2");
      } else if (req.user.credit < cost) {
        res.send("con3");
      } else if (req.user.occupied == true) {
        res.send("con4");
      } else if (car.availability == false) {
        res.send("con5");
      } else {
        // update car to unavailable
        let upCar = await mainApp.updateDocObj(Car, car._id, { availability: false });

        // make rent
        let start = new Date();
        let end = new Date(start.getTime() + rentTime * 60 * 60 * 1000);
        let makeRent = {
          car: car._id,
          renter: req.user._id,
          startTime: start.getTime(),
          endTime: end.getTime(),
          cost: cost,
          rentClosed: false,
        };

        Rent.create(makeRent, async function (err, rent1) {
          if (err) {
            console.log(err);
          } else {
            let deduction = req.user.credit - cost;
            var newRents;

            req.user.rents.push(rent1._id.toString());
            newRents = req.user.rents;

            let userUp = {
              credit: deduction,
              rents: newRents,
              occupied: true,
            };
            let userDeduct = await mainApp.updateDocObj(User, req.user._id, userUp);
          }
          res.send("/rentStatus/" + rent1._id);
          setTimeout(mainApp.closeRent, rentTime * 60 * 60 * 1000, rent1._id);
        });
      }
    } else {
      res.send("/signin");
    }
  } catch (error) {
    console.log(error);
    res.send("con6");
  }
};

const rentStatus = async function (req, res, next) {
  try {
    if (req.isAuthenticated()) {
      let rent = await mainApp.getOneDoc(Rent, req.params.rentID);

      if (req.user._id == rent.renter || req.user.admin == true) {
        let car = await mainApp.getOneDoc(Car, rent.car);
        let user = await mainApp.processUser(req.user);
        let renter = await mainApp.getOneDoc(User, rent.renter);
        let rentPack = {
          user: user,
          car: car,
          renter: renter,
          auth: true,
          rent: rent,
        };
        res.render("rentStatus", rentPack);
      } else {
        res.render("error", { message: "Unauthorized 1" });
      }
    } else {
      res.redirect("/signin");
    }
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const rentReview = async function (req, res, next) {
  try {
    let rent = await mainApp.getOneDoc(Rent, req.params.rentID);
    if (req.user._id == rent.renter || req.user.admin == true) {
      let user = await mainApp.processUser(req.user);
      res.render("rentEnd", { user: user, auth: true, rent: rent });
    } else {
      const err = new HttpError("Unauthorized request, you don't have access to this data.", 401);
      return next(err);
    }
  } catch (error) {
    console.log(error);
    const err = new HttpError("Internal server error.", 500);
    return next(err);
  }
};

const rentClose = async function (req, res, next) {
  let rent = await mainApp.getOneDoc(Rent, req.params.rentID);
  if (req.user._id == rent.renter || req.user.admin == true) {
    if (rent.rentClosed == false) {
      let resLeft = Number(req.session.resLeft);
      let userUp = await mainApp.updateDocObj(User, rent.renter, { occupied: false });
      let carUp = await mainApp.updateDocObj(Car, rent.car, { availability: true, resourceLeft: resLeft });
      let rentUp = await mainApp.updateDocObj(Rent, req.params.rentID, { rentClosed: true });
      res.redirect("/rentStatus/" + rent._id);
    } else {
      const err = new HttpError("Unauthorized, rent already closed.", 401);
      return next(err);
    }
  } else {
    const err = new HttpError("Unauthorized request, you don't have access to this data.", 401);
    return next(err);
  }
};

const postResource = function (req, res) {
  req.session.resLeft = req.body.oilleft;
  res.redirect("/rentClose/" + req.params.rentID);
};

exports.myrents = myrents;
exports.rentProcess1 = rentProcess1;
exports.rentStatus = rentStatus;
exports.rentReview = rentReview;
exports.rentClose = rentClose;
exports.postResource = postResource;
