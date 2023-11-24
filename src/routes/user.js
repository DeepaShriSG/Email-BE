import express from "express";
import UsersController from "../controller/user.js";
import Auth from "../common/auth.js";

const router = express.Router();

router.get("/", Auth.validate,UsersController.getUsers);
router.post("/", UsersController.createUsers);
router.post("/login", UsersController.login);
router.post('/forgetpassword',UsersController.forgotPassword)
router.post('/resetpassword',Auth.validate,UsersController.resetPassword)

export default router;
