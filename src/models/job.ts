import { Schema, model, Document } from "mongoose";

interface JobDocument extends Document {
  title: string;
  description: string;
  category: string;
  company: string;
  location: string;
  type: string;
  postedDate: Date;
  closingDate: Date;
  salary: number;
  requirements: string[];
}

const jobSchema = new Schema<JobDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  postedDate: { type: Date, required: true, default: Date.now },
  closingDate: { type: Date, required: true },
  salary: { type: Number, required: true },
  requirements: [{ type: String, required: true }],
});

const JobModel = model<JobDocument>("Job", jobSchema);
export default JobModel;
