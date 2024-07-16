import { Router } from "express";
import {
  createJob,
  deleteJob,
  getJob,
  getJobListings,
  getJobsByCategory,
  getLatestJobs,
  updateJob,
} from "src/controllers/job";

import { isAuth } from "src/middleware/auth";
import { validate } from "src/middleware/validator";
import { jobSchema } from "src/utils/validationSchema";

const jobRouter = Router();

jobRouter.post("/", isAuth, validate(jobSchema), createJob);
jobRouter.patch("/:id", isAuth, validate(jobSchema), updateJob);
jobRouter.delete("/:id", isAuth, deleteJob);
jobRouter.get("/:id", isAuth, getJob);
jobRouter.get("/by-category/:category", isAuth, getJobsByCategory);
jobRouter.get("/latest", isAuth, getLatestJobs);
jobRouter.get("/listings", isAuth, getJobListings);

export default jobRouter;
