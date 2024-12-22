const express = require("express");
const route = express.Router();
const authController = require("../controller/authController");

route.post("/signup", authController.signup);
route.post("/login", authController.login);
route.get("/getAlluser", authController.userinfo);

route.post('/forgetPassword', authController.forgotPassword);
route.patch('/resetPassword/:token', authController.resetPassword);

module.exports = route;
