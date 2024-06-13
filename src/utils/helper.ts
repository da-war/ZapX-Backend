import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string
) => {
  res.status(statusCode).send(message);
};
