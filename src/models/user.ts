import { Document, model, Schema } from "mongoose";

import { compare, genSalt, hash } from "bcrypt";
import { object } from "yup";

export interface UserDocument extends Document {
  email: string;
  password: string;
  role: string;
  name: string;
  isVerified: boolean;
  tokens: string[];
  avatar?: {
    url: string;
    id: string;
  };
  preferences?: [string];
}

interface Methods {
  comparePassword(password: string): Promise<boolean>;
}

export const userSchema = new Schema<UserDocument, {}, Methods>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: "user" },
    name: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    tokens: [String],
    preferences: [String],
    avatar: {
      type: Object,
      url: String,
      id: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await genSalt(10);
    this.password = await hash(this.password, salt);
  }
  next();
});
userSchema.methods.comparePassword = async function (password) {
  return await compare(password, this.password);
};

const UserModal = model("User", userSchema);

export default UserModal;
