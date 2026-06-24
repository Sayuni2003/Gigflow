import { Router } from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";
import gigRouter from "./gigRoutes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/gigs", gigRouter);

export default apiRouter;
