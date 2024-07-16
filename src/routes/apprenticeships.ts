import { Router } from "express";

import { isAuth } from "../middleware/auth";
import { validate } from "../middleware/validator";
import { apprenticeshipSchema } from "../utils/validationSchema";
import {
  createApprenticeship,
  deleteApprenticeship,
  getApprenticeship,
  getApprenticeshipListings,
  getApprenticeshipsByCategory,
  getLatestApprenticeships,
  updateApprenticeship,
} from "src/controllers/apprenticeship";

const apprenticeshipRouter = Router();

apprenticeshipRouter.post(
  "/",
  isAuth,
  validate(apprenticeshipSchema),
  createApprenticeship
);
apprenticeshipRouter.patch(
  "/:id",
  isAuth,
  validate(apprenticeshipSchema),
  updateApprenticeship
);
apprenticeshipRouter.delete("/:id", isAuth, deleteApprenticeship);
apprenticeshipRouter.get("/:id", isAuth, getApprenticeship);
apprenticeshipRouter.get(
  "/by-category/:category",
  isAuth,
  getApprenticeshipsByCategory
);
apprenticeshipRouter.get("/latest", isAuth, getLatestApprenticeships);
apprenticeshipRouter.get("/listings", isAuth, getApprenticeshipListings);

export default apprenticeshipRouter;
