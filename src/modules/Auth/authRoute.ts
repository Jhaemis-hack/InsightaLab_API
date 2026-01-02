import express from "express";
import { userLogin } from "./authController";

const AuthRouter = express.Router();

// User login route
AuthRouter.post("/login", userLogin);

export default AuthRouter;
