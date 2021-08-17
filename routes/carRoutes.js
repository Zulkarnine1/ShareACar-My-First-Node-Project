const { Router } = require("express");
const carController = require("../controllers/car-controller");
const route = Router();

route.get("/car/:carID", carController.getCarByID);

route.get("/search/:query", carController.searchCar);

module.exports = route;
