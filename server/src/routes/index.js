import { Router } from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);

export default apiRouter;
