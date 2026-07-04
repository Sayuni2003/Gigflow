import { Router } from "express";
import {
  create,
  update,
  remove,
  getAll,
  getMyGigs,
  getCategories,
  getSingle,
} from "../controllers/gigController.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { upload } from "../middlewares/upload.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const gigRouter = Router();

gigRouter.get("/categories", asyncHandler(getCategories));

gigRouter.get("/", asyncHandler(getAll));

gigRouter.get(
  "/my-gigs",
  authenticate,
  authorize("FREELANCER"),
  asyncHandler(getMyGigs),
);

gigRouter.get("/:id", asyncHandler(getSingle));

gigRouter.post(
  "/",
  authenticate,
  authorize("FREELANCER"),
  upload.single("image"),
  asyncHandler(create),
);

gigRouter.put(
  "/:id",
  authenticate,
  authorize("FREELANCER"),
  upload.single("image"),
  asyncHandler(update),
);

gigRouter.delete(
  "/:id",
  authenticate,
  authorize("FREELANCER"),
  asyncHandler(remove),
);

export default gigRouter;
