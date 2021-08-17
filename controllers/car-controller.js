const mainApp = require("../utility/main");
const Car = require("../models/car");
const HttpError = require("../models/http-error");
const ObjectId = require("mongoose").Types.ObjectId;

const getCarByID = async function (req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.carID)) {
      return next(new HttpError("Car with this ID doesn't exist", 404));
    }

    const car = await Car.findById(req.params.carID);

    if (!car) {
      return next(new HttpError("Car with this ID doesn't exist", 404));
    } else {
      if (req.isAuthenticated()) {
        let user = await mainApp.processUser(req.user);
        let homePack = {
          car: car,
          user: user,
          auth: true,
        };
        res.render("carDis", homePack);
      } else {
        let homePack = {
          car: car,
          auth: false,
        };
        res.render("carDis", homePack);
      }
    }
  } catch (error) {
    console.log(error);
    const err = new HttpError("Getting car failed due to internal server error.", 500);
    return next(err);
  }
};

const searchCar = async function (req, res) {
  try {
    let query = req.params.query;
    var result = [];

    if (ObjectId.isValid(query.toString())) {
      let car = await mainApp.searchID(Car, query);
      if (car.bool == true) {
        result.push(car.doc);
      }
    }
    var aggRet = await mainApp.aggSearch(Car, query.toString());
    result = result.concat(aggRet);

    if (req.isAuthenticated()) {
      let user = await mainApp.processUser(req.user);

      let searchPack = {
        user: user,
        auth: true,
        query: query,
        result: result,
      };
      res.render("searchCar", searchPack);
    } else {
      let searchPack = {
        auth: false,
        query: query,
        result: result,
      };

      res.render("searchCar", searchPack);
    }
  } catch (error) {
    console.log(error);
    const err = new HttpError("Searching cars failed due to internal server error.", 500);
    return next(err);
  }
};

exports.searchCar = searchCar;

exports.getCarByID = getCarByID;
