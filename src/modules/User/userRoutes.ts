import { Router } from "express";
import {
  createNewProfile,
  deleteUserProfile,
  exportProfiles,
  fetchAllProfiles,
  fetchUserProfile,
  searchProfiles,
} from "./user.controller";
import { apiVersion } from "../../helpers/apiVersion";
import auth_N from "../../middleware/AuthN";
import auth_Z from "../../middleware/AuthZ";

const userRouter = Router();

userRouter.use(apiVersion);

userRouter.post("/", auth_N, auth_Z("admin"), createNewProfile);

userRouter.get("/", auth_N, fetchAllProfiles);

userRouter.get("/search", auth_N, searchProfiles);

userRouter.get("/:profile_id", auth_N, fetchUserProfile);

userRouter.get("/export",  auth_N, auth_Z("admin"), exportProfiles);

userRouter.delete("/:profile_id", auth_N, auth_Z("admin"), deleteUserProfile);

export default userRouter;
