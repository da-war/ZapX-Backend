import { Router } from "express";
import {
  createNewUser,
  grantValid,
  refreshToken,
  regeneratePassword,
  sendProfile,
  sendPublicProfile,
  sendVerificationToken,
  signIn,
  signOut,
  updateAvatar,
  updateProfile,
  verifyEmail,
} from "controllers/auth";
import { validate } from "src/middleware/validator";
import { newUserSchema, verifyTokenSchema } from "src/utils/validationSchema";
import { isAuth, isValidPasswordResetToken } from "src/middleware/auth";
import fileParser from "src/middleware/fileparser";
import { deleteProduct } from "src/controllers/product";

const authRouter = Router();

authRouter.post("/sign-up", validate(newUserSchema), createNewUser);
authRouter.post("/verify", validate(verifyTokenSchema), verifyEmail);
authRouter.post("/resend-verification", isAuth, sendVerificationToken);
authRouter.post("/login", signIn);
authRouter.get("/profile", isAuth, sendProfile);
authRouter.post("/refresh-token", refreshToken);
authRouter.get("/sign-out", isAuth, signOut);
authRouter.post("/forgot-password", regeneratePassword);
authRouter.get(
  "/verify-pass-reset-token",
  validate(verifyTokenSchema),
  isValidPasswordResetToken,
  grantValid
);

authRouter.patch("/update-profile", isAuth, updateProfile);
authRouter.delete("/delete", isAuth, deleteProduct);

authRouter.patch("/update-avatar", isAuth, fileParser, updateAvatar);
authRouter.get("/profile/:id", isAuth, sendPublicProfile);

export default authRouter;
