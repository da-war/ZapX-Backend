import { RequestHandler } from "express";
import ApprenticeshipModel from "../models/apprenticeship";
import { sendResponse } from "../utils/helper";
import { isValidObjectId } from "mongoose";

export const createApprenticeship: RequestHandler = async (req, res) => {
  const {
    title,
    description,
    category,
    company,
    location,
    type,
    postedDate,
    closingDate,
    salary,
    duration,
    requirements,
  } = req.body;
  const apprenticeship = new ApprenticeshipModel({
    title,
    description,
    category,
    company,
    location,
    type,
    postedDate,
    closingDate,
    salary,
    duration,
    requirements,
    owner: req.user.id,
  });

  await apprenticeship.save();
  sendResponse(res, 201, "Apprenticeship created successfully");
};

export const updateApprenticeship: RequestHandler = async (req, res) => {
  const apprenticeshipId = req.params.id;

  if (!isValidObjectId(apprenticeshipId)) {
    return sendResponse(res, 422, "Invalid apprenticeship id");
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
    salary,
    duration,
    requirements,
  } = req.body;
  const apprenticeship = await ApprenticeshipModel.findOneAndUpdate(
    { _id: apprenticeshipId, owner: req.user.id },
    {
      title,
      description,
      category,
      company,
      location,
      type,
      postedDate,
      closingDate,
      salary,
      duration,
      requirements,
    },
    { new: true }
  );

  if (!apprenticeship) {
    return sendResponse(res, 404, "Apprenticeship not found");
  }

  await apprenticeship.save();
  sendResponse(res, 200, "Apprenticeship updated successfully");
};

export const deleteApprenticeship: RequestHandler = async (req, res) => {
  const apprenticeshipId = req.params.id;

  if (!isValidObjectId(apprenticeshipId)) {
    return sendResponse(res, 422, "Invalid apprenticeship id");
  }

  const apprenticeship = await ApprenticeshipModel.findOneAndDelete({
    _id: apprenticeshipId,
    owner: req.user.id,
  });

  if (!apprenticeship) {
    return sendResponse(res, 404, "Apprenticeship not found");
  }

  sendResponse(res, 200, "Apprenticeship deleted successfully");
};

export const getApprenticeship: RequestHandler = async (req, res) => {
  const apprenticeshipId = req.params.id;

  if (!isValidObjectId(apprenticeshipId)) {
    return sendResponse(res, 422, "Invalid apprenticeship id");
  }

  const apprenticeship = await ApprenticeshipModel.findById(
    apprenticeshipId
  ).populate("owner");
  if (!apprenticeship) {
    return sendResponse(res, 404, "Apprenticeship not found");
  }

  sendResponse(res, 200, "Apprenticeship fetched successfully", apprenticeship);
};

export const getApprenticeshipsByCategory: RequestHandler = async (
  req,
  res
) => {
  const category = req.params.category;

  const apprenticeships = await ApprenticeshipModel.find({ category });
  if (!apprenticeships.length) {
    return sendResponse(res, 404, "No apprenticeships found in this category");
  }

  sendResponse(
    res,
    200,
    "Apprenticeships fetched successfully",
    apprenticeships
  );
};

export const getLatestApprenticeships: RequestHandler = async (req, res) => {
  const apprenticeships = await ApprenticeshipModel.find()
    .sort({ postedDate: -1 })
    .limit(10);
  if (!apprenticeships.length) {
    return sendResponse(res, 404, "No apprenticeships found");
  }

  sendResponse(
    res,
    200,
    "Latest apprenticeships fetched successfully",
    apprenticeships
  );
};

export const getApprenticeshipListings: RequestHandler = async (req, res) => {
  const apprenticeships = await ApprenticeshipModel.find({
    owner: req.user.id,
  });
  if (!apprenticeships.length) {
    return sendResponse(res, 404, "No apprenticeships found");
  }

  sendResponse(
    res,
    200,
    "Apprenticeship listings fetched successfully",
    apprenticeships
  );
};
