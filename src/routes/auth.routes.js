import { Router } from "express";
import { login, registerUser ,logoutUser, verifyEmail, refreshAccessToken, ForgotPasswordRequest, resetForgotPassword, getCurrentUser, changeCurrentPassword, resendEmailVerification} from "../controllers/auth.controllers.js";
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator,userLoginValidator, userForgotPasswordValidator, userResetForgotPasswordValidator, userChangeCurrentPasswordValidator } from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router =Router();
//unsecured
router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/login").post(userLoginValidator(),validate,login);
router.route("/verfiy-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,ForgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator,validate,resetForgotPassword);

//secured as jwt required
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").post(verifyJWT,getCurrentUser);
router.route("/change-password").post(verifyJWT,userChangeCurrentPasswordValidator,validate,changeCurrentPassword);
router.route("/resend-email-varification").post(verifyJWT,resendEmailVerification);

export default router;


