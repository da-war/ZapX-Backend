import { NextFunction, Request, Response } from "express";
import { sendResponse } from "src/utils/helper";
import * as Yup from "yup";

export const validate =
  (schema: Yup.Schema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate(
        { ...req.body },
        { strict: true, abortEarly: true }
      );
      next();
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        sendResponse(res, 422, error.message);
      } else {
        next(error);
      }
    }
  };
