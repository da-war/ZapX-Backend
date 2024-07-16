import { Schema, model, Document } from "mongoose";

interface InternshipDocument extends Document {
  title: string;
  description: string;
  category: string;
  company: string;
  location: string;
  type: string;
  postedDate: Date;
  closingDate: Date;
  stipend: number;
  duration: string;
  requirements: string[];
}

const internshipSchema = new Schema<InternshipDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, required: true },
  postedDate: { type: Date, required: true, default: Date.now },
  closingDate: { type: Date, required: true },
  stipend: { type: Number, required: true },
  duration: { type: String, required: true },
  requirements: [{ type: String, required: true }],
});

const InternshipModel = model<InternshipDocument>(
  "Internship",
  internshipSchema
);
export default InternshipModel;
