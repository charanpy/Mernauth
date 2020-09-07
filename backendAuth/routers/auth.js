const express = require('express')
const router = express.Router();

//^Validators
const {
            validRegister,
            validLogin,
            forgetPasswordValidator,
            resetPasswordValidator,

} = require('../helper/valid')

const {
            registerController,
            activationController,
            signinController,
            forgotController,
            resetController,
            googleController
} = require('../controllers/auth.js')

router.post("/register", validRegister, registerController);
router.post("/activation", activationController);
router.post("/login", validLogin, signinController);
router.post("/password/forget", forgetPasswordValidator, forgotController)
router.put("/resetPassword", resetPasswordValidator, resetController)

//google oauth
router.post("/googlelogin", googleController)



module.exports = router;