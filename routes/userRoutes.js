const { Router } = require("express");
const userController = require("../controllers/userController");
const { authenReq } = require("../middlewares/auth-middleware");

const router = Router();

router.get("/account", authenReq, userController.accountPageController);

router.get("/editaccount", authenReq, userController.editAccountPageHandler);

router.post("/userEditAcc/:userID", authenReq, userController.postUserEditAcc);

router.get("/signin", userController.getSignIn);

router.get("/signup", userController.getSignUp);

router.post("/signIn", userController.postSignIn);

// signup post route

router.post("/signUp", userController.postSignUp);

router.get("/signOut", authenReq, userController.signout);

module.exports = router;
