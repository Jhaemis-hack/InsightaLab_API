import express from "express";
import auth_N from "../../middleware/AuthN";
import { userLogin } from "./authController";

const AuthRouter = express.Router();

// User login route
AuthRouter.post("/login", userLogin);


export default AuthRouter;