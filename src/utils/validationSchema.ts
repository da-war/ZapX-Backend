import { isValidObjectId } from "mongoose";
import * as yup from "yup";
import categories from "./categories";
import { parseISO } from "date-fns";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/;

yup.addMethod(yup.string, "email", function validateEmail(message) {
  return this.matches(emailRegex, {
    message,
    name: "email",
    excludeEmptyString: true,
  });
});

const password = {
  password: yup
    .string()
    .required("Password is missing")
    .min(8, "Password should be at least 8 chars long!")
    .matches(passwordRegex, "Password is too simple."),
};

export const newUserSchema = yup.object({
  name: yup.string().required("Name is missing"),
  email: yup.string().email("Invalid email!").required("Email is missing"),
  ...password,
});

const tokenAndId = {
  id: yup.string().test({
    name: "valid-id",
    message: "Invalid user id",
    test: (value) => {
      return isValidObjectId(value);
    },
  }),
  token: yup.string().required("Token is missing"),
};

export const verifyTokenSchema = yup.object({
  ...tokenAndId,
});

export const resetPassSchema = yup.object({
  ...tokenAndId,
  ...password,
});

export const newProductSchema = yup.object({
  name: yup.string().required("Name is missing"),
  price: yup
    .string()
    .transform((value) => {
      if (isNaN(+value)) {
        return "";
      }
      return +value;
    })
    .required("Price is missing"),
  category: yup
    .string()
    .oneOf(categories, "Invalid Category")
    .required("Category is missing"),
  // images: yup.array().of(
  //   yup.object({
  //     url: yup.string().required("Image url is missing"),
  //     id: yup.string().required("Image id is missing"),
  //   })
  // ),
  // thumbnail: yup.string().required("Thumbnail is missing"),
  description: yup.string().required("Description is missing"),
  purchasingDate: yup
    .string()
    .transform((value) => {
      try {
        return parseISO(value);
      } catch (error) {
        return "";
      }
    })
    .required("Purchasing date is missing"),
});

import * as Yup from "yup";

export const jobSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  category: Yup.string().required("Category is required"),
  company: Yup.string().required("Company is required"),
  location: Yup.string().required("Location is required"),
  type: Yup.string().required("Type is required"),
  postedDate: Yup.date().required("Posted date is required"),
  closingDate: Yup.date().required("Closing date is required"),
  salary: Yup.number().required("Salary is required"),
  requirements: Yup.array().of(
    Yup.string().required("Requirement is required")
  ),
});

export const internshipSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  category: Yup.string().required("Category is required"),
  company: Yup.string().required("Company is required"),
  location: Yup.string().required("Location is required"),
  type: Yup.string().required("Type is required"),
  postedDate: Yup.date().required("Posted date is required"),
  closingDate: Yup.date().required("Closing date is required"),
  stipend: Yup.number().required("Stipend is required"),
  duration: Yup.string().required("Duration is required"),
  requirements: Yup.array().of(
    Yup.string().required("Requirement is required")
  ),
});

export const apprenticeshipSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  category: Yup.string().required("Category is required"),
  company: Yup.string().required("Company is required"),
  location: Yup.string().required("Location is required"),
  type: Yup.string().required("Type is required"),
  postedDate: Yup.date().required("Posted date is required"),
  closingDate: Yup.date().required("Closing date is required"),
  salary: Yup.number().required("Salary is required"),
  duration: Yup.string().required("Duration is required"),
  requirements: Yup.array().of(
    Yup.string().required("Requirement is required")
  ),
});
