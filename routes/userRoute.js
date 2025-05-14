
const express = require('express');
const {registerUser, loginUser, logoutUser, verifyEmail} = require("../controller/userController.js");
const { isAuthenticatedUser, emailVerification } = require('../middleware/auth.js');
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/verify-email").get(emailVerification, verifyEmail);
module.exports = router;