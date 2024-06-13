import { compare } from "bcrypt";
//typescript
import nodemailer from "nodemailer";

import { RequestHandler } from "express";
import UserModal from "src/models/user";

import crypto from "crypto";
import AuthVerificationModel from "src/models/authVerificationToken";
import { sendResponse } from "src/utils/helper";

import jwt from "jsonwebtoken";
import PasswordResetTokenModel from "src/models/passwordReset";
import mail from "src/utils/mail";
import { isValidObjectId } from "mongoose";
import cloudinaryUploader from "src/cloud";

const VERIFYEMAIL = process.env.VERIFY_EMAIL_LINK;
const VERIFYHTML = process.env.VERIFY_HTML_LINK;
const JWT_SECRET = process.env.JWT_SECRET!;
const PASSWORD_RESET_LINK = process.env.PASSWORD_RESET_LINK!;

export const createNewUser: RequestHandler = async (req, res) => {
  //read incoming data
  const { email, password, name, role, isVerified } = req.body;
  //validate incoming data
  if (!email || !password || !name || !role) {
    return sendResponse(res, 400, "Please provide all fields");
  }

  //check if user already exists
  const isUser = await UserModal.findOne({ email });

  if (isUser) {
    return sendResponse(res, 409, "User already exists");
  }

  //create new user
  const user = await UserModal.create({ name, email, password });
  //generate a token
  const token = crypto.randomBytes(32).toString("hex");
  await AuthVerificationModel.create({ owner: user._id, token });
  //send the token to the user's email
  const link = `${VERIFYEMAIL}?id=${user._id}&token=${token}`;
  //send link as response
  await mail.sendVerification(user.email, link);
  // 8. Send message back to check email inbox.
  res.json({ message: "Please check your inbox." });
};

export const verifyEmail: RequestHandler = async (req, res) => {
  const { id, token } = req.body;

  const authToken = await AuthVerificationModel.findOne({ owner: id });
  console.log("auth token", authToken);

  if (!authToken) {
    return sendResponse(res, 403, "User not found");
  }
  const isMatched = await authToken.compareToken(token);

  console.log("|isMatched", isMatched);

  if (!isMatched) {
    return sendResponse(res, 403, "Invalid Token");
  }

  await UserModal.findByIdAndUpdate(id, { isVerified: true });

  sendResponse(res, 200, "Welcome to ZapXm, Email verified successfully");
};

export const signIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, "Please provide all fields");
  }

  const user = await UserModal.findOne({ email });

  if (!user) {
    return sendResponse(res, 404, "Email/Password is incorrect");
  }

  const isMatched = await user.comparePassword(password);

  if (!isMatched) {
    return sendResponse(res, 404, "Email/Password is incorrect");
  }

  const payload = { id: user._id };

  const accessToken = jwt.sign(payload, "Secret", {
    expiresIn: "15m",
  });
  console.log("access token", accessToken);
  const refreshToken = jwt.sign(payload, "Secret");
  console.log("refresh token", refreshToken);

  if (!user.tokens) {
    user.tokens = [refreshToken];
  } else {
    user.tokens.push(refreshToken);
  }

  await user.save();

  res.json({
    profile: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    tokens: {
      access: accessToken,
      refresh: refreshToken,
    },
  });
};

export const sendProfile: RequestHandler = async (req, res) => {
  res.json({
    profile: req.user,
  });
};

export const sendVerificationToken: RequestHandler = async (req, res) => {
  const user = req.user;

  if (user.isVerified) {
    return sendResponse(res, 400, "Email already verified");
  }

  await AuthVerificationModel.findOneAndDelete({ owner: user.id });

  const token = crypto.randomBytes(32).toString("hex");

  await AuthVerificationModel.create({ owner: user.id, token });

  const link = `${VERIFYHTML}?id=${user.id}&token=${token}`;

  await mail.sendVerification(req.user.email, link);

  res.json({ message: "Please check your inbox." });
};

export const refreshToken: RequestHandler = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendResponse(res, 403, "Unauthorized Token");
  }

  const payload = jwt.verify(refreshToken, JWT_SECRET) as { id: string };

  if (payload.id) {
    const user = await UserModal.findOne({
      _id: payload.id,
      tokens: refreshToken,
    });

    if (!user) {
      //user is compromised remove all tokens
      await UserModal.findByIdAndUpdate(payload.id, { tokens: [] });
      return sendResponse(res, 403, "Unauthorized Token");
    }

    const newAcessToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const newRefreshToken = jwt.sign({ id: user._id }, JWT_SECRET);

    const filtered = user.tokens.filter((token) => token !== refreshToken);
    user.tokens.push(newRefreshToken);
    user.tokens = filtered;

    await user.save();

    res.json({
      tokens: {
        access: newAcessToken,
        refresh: newRefreshToken,
      },
    });
  } else {
    return sendResponse(res, 403, "Unauthorized Token");
  }
};

export const signOut: RequestHandler = async (req, res) => {
  const user = await UserModal.findOne({
    _id: req.user.id,
    tokens: req.body.refreshToken,
  });

  if (!user) {
    return sendResponse(res, 403, "Unauthorized request, User not found!");
  }

  const filtered = user.tokens.filter(
    (token) => token !== req.body.refreshToken
  );
  user.tokens = filtered;
  await user.save();

  res.send();
};
export const regeneratePassword: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await UserModal.findOne({ email });

  if (!user) {
    return sendResponse(res, 404, "User not found");
  }

  await PasswordResetTokenModel.findOne({
    owner: user._id,
  });

  const token = crypto.randomBytes(32).toString("hex");
  await PasswordResetTokenModel.create({ owner: user._id, token });
  const passwordResetLink = `${PASSWORD_RESET_LINK}?id=${user._id}&token=${token}`;
  await mail.sendPasswordResetLink(user.email, passwordResetLink);
  // send response back
  res.json({ message: "Please check your email." });
};
export const grantValid: RequestHandler = async (req, res) => {
  res.json({ message: "Valid token" });
};

export const updateProfile: RequestHandler = async (req, res) => {
  const { name } = req.body;

  if (typeof name !== "string" || name.trim().length < 3) {
    return sendResponse(res, 422, "Invalid name");
  }

  await UserModal.findByIdAndUpdate(req.user.id, { name });

  res.json({
    ...req.user,
    name,
  });
};

export const updateAvatar: RequestHandler = async (req, res) => {
  const { avatar } = req.files;

  if (Array.isArray(avatar)) {
    return sendResponse(res, 422, "Multiple files are not allowed");
  }

  if (!avatar.mimetype?.startsWith("image")) {
    return sendResponse(res, 422, "Invalid file type");
  }

  const user = await UserModal.findById(req.user.id);

  if (!user) {
    return sendResponse(res, 404, "User not found");
  }

  if (user.avatar?.id) {
    //delete previous avatar
    await cloudinaryUploader.destroy(user.avatar.id);
  }

  const { secure_url: url, public_id: id } = await cloudinaryUploader.upload(
    avatar.filepath,
    {
      width: 300,
      height: 300,
      crop: "thumb",
      gravity: "face",
      folder: "avatars",
    }
  );

  user.avatar = { url, id };
  await user.save();

  res.json({
    profile: {
      ...req.user,
      avatar: user.avatar.url,
    },
  });
};

export const sendPublicProfile: RequestHandler = async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return sendResponse(res, 422, "Invalid Profile Id!");
  }

  const user = await UserModal.findById(id);

  if (!user) {
    return sendResponse(res, 404, "User not found");
  }

  res.json({
    profile: {
      id: user._id,
      name: user.name,
      avatar: user.avatar,
    },
  });
};
