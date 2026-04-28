import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  description: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
  role: string;
  skills: string[];
  salaryRange?: string;
  sourceUrl: string;
  source: string;
  postedAt: string;
  isActive: boolean;
  createdAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    type: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'remote', 'internship'],
      default: 'full-time',
    },
    role: { type: String, default: 'Engineering' },
    skills: [{ type: String }],
    salaryRange: { type: String },
    sourceUrl: { type: String, default: '#' },
    source: { type: String, default: 'Admin' },
    postedAt: { type: String, default: 'Recently' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

JobSchema.index({ title: 'text', company: 'text', description: 'text' });

export default mongoose.model<IJob>('Job', JobSchema);
