import { v2 as cloudinary } from "cloudinary";

const CLOUDINARY_SECRET = process.env.CLOUDINARY_SECRET!;
const CLOUDINARY_KEY = process.env.CLOUDINARY_KEY!;
const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME!;

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
  secure: true,
});

const cloudinaryUploader = cloudinary.uploader;
export const cloudApi = cloudinary.api;

export default cloudinaryUploader;
