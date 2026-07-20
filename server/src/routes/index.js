import { Router } from "express";
import authRouter from "./authRoutes.js";
import userRouter from "./userRoutes.js";
import gigRouter from "./gigRoutes.js";
import orderRouter from "./orderRoutes.js";
import paymentRouter from "./paymentRoutes.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/gigs", gigRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/payments", paymentRouter);

export default apiRouter;
