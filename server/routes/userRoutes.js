import express from "express";
import isAuthenticated from "../middlewares/auth.js";

import {
  register,
  login,
  getMyProfile,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", register);

userRouter.get("/login", login);

userRouter.get("/myProfile", isAuthenticated, getMyProfile);

export default userRouter;
