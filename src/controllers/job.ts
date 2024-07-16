import { RequestHandler } from "express";
import JobModel from "src/models/job";
import { sendResponse } from "src/utils/helper";
import { isValidObjectId } from "mongoose";

export const createJob: RequestHandler = async (req, res) => {
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
    requirements,
  } = req.body;
  const job = new JobModel({
    title,
    description,
    category,
    company,
    location,
    type,
    postedDate,
    closingDate,
    salary,
    requirements,
    owner: req.user.id,
  });

  await job.save();
  sendResponse(res, 201, "Job created successfully");
};

export const updateJob: RequestHandler = async (req, res) => {
  const jobId = req.params.id;

  if (!isValidObjectId(jobId)) {
    return sendResponse(res, 422, "Invalid job id");
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
    requirements,
  } = req.body;
  const job = await JobModel.findOneAndUpdate(
    { _id: jobId, owner: req.user.id },
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
      requirements,
    },
    { new: true }
  );

  if (!job) {
    return sendResponse(res, 404, "Job not found");
  }

  await job.save();
  sendResponse(res, 200, "Job updated successfully");
};

export const deleteJob: RequestHandler = async (req, res) => {
  const jobId = req.params.id;

  if (!isValidObjectId(jobId)) {
    return sendResponse(res, 422, "Invalid job id");
  }

  const job = await JobModel.findOneAndDelete({
    _id: jobId,
    owner: req.user.id,
  });

  if (!job) {
    return sendResponse(res, 404, "Job not found");
  }

  sendResponse(res, 200, "Job deleted successfully");
};

export const getJob: RequestHandler = async (req, res) => {
  const jobId = req.params.id;

  if (!isValidObjectId(jobId)) {
    return sendResponse(res, 422, "Invalid job id");
  }

  const job = await JobModel.findById(jobId).populate("owner");
  if (!job) {
    return sendResponse(res, 404, "Job not found");
  }

  sendResponse(res, 200, "Job fetched successfully", job);
};

export const getJobsByCategory: RequestHandler = async (req, res) => {
  const category = req.params.category;

  const jobs = await JobModel.find({ category });
  if (!jobs.length) {
    return sendResponse(res, 404, "No jobs found in this category");
  }

  sendResponse(res, 200, "Jobs fetched successfully", jobs);
};

export const getLatestJobs: RequestHandler = async (req, res) => {
  const jobs = await JobModel.find().sort({ postedDate: -1 }).limit(10);
  if (!jobs.length) {
    return sendResponse(res, 404, "No jobs found");
  }

  sendResponse(res, 200, "Latest jobs fetched successfully", jobs);
};

export const getJobListings: RequestHandler = async (req, res) => {
  const jobs = await JobModel.find({ owner: req.user.id });
  if (!jobs.length) {
    return sendResponse(res, 404, "No jobs found");
  }

  sendResponse(res, 200, "Job listings fetched successfully", jobs);
};
