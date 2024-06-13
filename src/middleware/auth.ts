import { refreshToken } from "./../controllers/auth";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { RequestHandler } from "express";
import UserModal from "src/models/user";
import { sendResponse } from "src/utils/helper";
import PasswordResetTokenModel from "src/models/passwordReset";

interface UserProfile {
  id: any;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
  refreshToken: string[];
  avatar?: {
    url: string;
    id: string;
  };
}

declare global {
  namespace Express {
    interface Request {
      user: UserProfile;
    }
  }
}

export const isAuth: RequestHandler = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authToken.split("Bearer ")[1];
    console.log("token", token);
    const payload = jwt.verify(token, "Secret") as { id: string };
    console.log("payload", payload);

    const user = await UserModal.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      refreshToken: user.tokens,
      avatar: user.avatar,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return sendResponse(res, 401, "token expired!");
    }

    if (error instanceof JsonWebTokenError) {
      return sendResponse(res, 401, "unauthorized assess!");
    }

    next(error);
  }
};
export const isValidPasswordResetToken: RequestHandler = async (
  req,
  res,
  next
) => {
  const { id, token } = req.params;

  const resetPassToken = await PasswordResetTokenModel.findOne({ owner: id });
  if (!resetPassToken) {
    return sendResponse(res, 404, "Unauthorized request, token not found");
  }

  const matched = await resetPassToken.compareToken(token);
  if (!matched) {
    return sendResponse(res, 404, "Unauthorized request, token not found");
  }

  next();
};
