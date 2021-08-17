const { Router } = require("express");
const adminController = require("../controllers/adminController");
const { adminAuthorReq } = require("../middlewares/auth-middleware");
const router = Router();

router.get("/adminhome", adminAuthorReq, adminController.adminHome);

router.get("/adminCars", adminAuthorReq, adminController.adminCars);

router.delete("/deleteCar/:carID", adminAuthorReq, adminController.adminDeleteCar);

router.get("/adminRents", adminAuthorReq, adminController.adminRents);

router.get("/adminRenters", adminAuthorReq, adminController.adminRenters);

router.get("/editUser/:userID", adminAuthorReq, adminController.getEditUser);

router.post("/addcredit/:userID", adminAuthorReq, adminController.getAddCredit);

router.get("/addcar", adminAuthorReq, adminController.getAddCar);

router.get("/editcar/:carID", adminAuthorReq, adminController.getEditCar);

router.post("/addCar", adminAuthorReq, adminController.postAddCar);

router.post("/editcar/:carID", adminAuthorReq, adminController.postEditCar);

module.exports = router;
