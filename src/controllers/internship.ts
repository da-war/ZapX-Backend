import { RequestHandler } from "express";
import InternshipModel from "src/models/internship";
import { sendResponse } from "src/utils/helper";
import { isValidObjectId } from "mongoose";

export const createInternship: RequestHandler = async (req, res) => {
  const {
    title,
    description,
    category,
    company,
    location,
    type,
    postedDate,
    closingDate,
    stipend,
    duration,
    requirements,
  } = req.body;
  const internship = new InternshipModel({
    title,
    description,
    category,
    company,
    location,
    type,
    postedDate,
    closingDate,
    stipend,
    duration,
    requirements,
    owner: req.user.id,
  });

  await internship.save();
  sendResponse(res, 201, "Internship created successfully");
};

export const updateInternship: RequestHandler = async (req, res) => {
  const internshipId = req.params.id;

  if (!isValidObjectId(internshipId)) {
    return sendResponse(res, 422, "Invalid internship id");
  }

  const {
    title,
    description,
    category,
    company,
    location,
    type,
    postedDate,
    closingDate,
    stipend,
    duration,
    requirements,
  } = req.body;
  const internship = await InternshipModel.findOneAndUpdate(
    { _id: internshipId, owner: req.user.id },
    {
      title,
      description,
      category,
      company,
      location,
      type,
      postedDate,
      closingDate,
      stipend,
      duration,
      requirements,
    },
    { new: true }
  );

  if (!internship) {
    return sendResponse(res, 404, "Internship not found");
  }

  await internship.save();
  sendResponse(res, 200, "Internship updated successfully");
};

export const deleteInternship: RequestHandler = async (req, res) => {
  const internshipId = req.params.id;

  if (!isValidObjectId(internshipId)) {
    return sendResponse(res, 422, "Invalid internship id");
  }

  const internship = await InternshipModel.findOneAndDelete({
    _id: internshipId,
    owner: req.user.id,
  });

  if (!internship) {
    return sendResponse(res, 404, "Internship not found");
  }

  sendResponse(res, 200, "Internship deleted successfully");
};

export const getInternship: RequestHandler = async (req, res) => {
  const internshipId = req.params.id;

  if (!isValidObjectId(internshipId)) {
    return sendResponse(res, 422, "Invalid internship id");
  }

  const internship = await InternshipModel.findById(internshipId).populate(
    "owner"
  );
  if (!internship) {
    return sendResponse(res, 404, "Internship not found");
  }

  sendResponse(res, 200, "Internship fetched successfully", internship);
};

export const getInternshipsByCategory: RequestHandler = async (req, res) => {
  const category = req.params.category;

  const internships = await InternshipModel.find({ category });
  if (!internships.length) {
    return sendResponse(res, 404, "No internships found in this category");
  }

  sendResponse(res, 200, "Internships fetched successfully", internships);
};

export const getLatestInternships: RequestHandler = async (req, res) => {
  const internships = await InternshipModel.find()
    .sort({ postedDate: -1 })
    .limit(10);
  if (!internships.length) {
    return sendResponse(res, 404, "No internships found");
  }

  sendResponse(
    res,
    200,
    "Latest internships fetched successfully",
    internships
  );
};

export const getInternshipListings: RequestHandler = async (req, res) => {
  const internships = await InternshipModel.find({ owner: req.user.id });
  if (!internships.length) {
    return sendResponse(res, 404, "No internships found");
  }

  sendResponse(
    res,
    200,
    "Internship listings fetched successfully",
    internships
  );
};
