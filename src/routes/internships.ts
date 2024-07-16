import { Router } from "express";

import { isAuth } from "../middleware/auth";
import { validate } from "../middleware/validator";
import {
  createInternship,
  deleteInternship,
  getInternship,
  getInternshipListings,
  getInternshipsByCategory,
  getLatestInternships,
  updateInternship,
} from "src/controllers/internship";
import { internshipSchema } from "src/utils/validationSchema";

const internshipRouter = Router();

internshipRouter.post(
  "/",
  isAuth,
  validate(internshipSchema),
  createInternship
);
internshipRouter.patch(
  "/:id",
  isAuth,
  validate(internshipSchema),
  updateInternship
);
internshipRouter.delete("/:id", isAuth, deleteInternship);
internshipRouter.get("/:id", isAuth, getInternship);
internshipRouter.get(
  "/by-category/:category",
  isAuth,
  getInternshipsByCategory
);
internshipRouter.get("/latest", isAuth, getLatestInternships);
internshipRouter.get("/listings", isAuth, getInternshipListings);

export default internshipRouter;
