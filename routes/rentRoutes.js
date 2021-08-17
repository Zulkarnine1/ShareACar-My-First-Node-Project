const { Router } = require("express");
const { authenReq } = require("../middlewares/auth-middleware");
const rentController = require("../controllers/rentController");

const router = Router();

router.get("/myrents", authenReq, rentController.myrents);

router.post("/rentprocess1/:carID", rentController.rentProcess1);

router.get("/rentStatus/:rentID", rentController.rentStatus);

router.get("/rentReview/:rentID", authenReq, rentController.rentReview);

router.get("/rentClose/:rentID", authenReq, rentController.rentClose);

router.post("/postOil/:rentID", authenReq, rentController.postResource);

module.exports = router;
