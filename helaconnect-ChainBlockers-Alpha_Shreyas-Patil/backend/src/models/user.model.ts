import mongoose, { Document, Schema } from 'mongoose';

export interface IEducation {
  degree: string;
  institution: string;
  year: number;
  fieldOfStudy: string;
}

export interface IWork {
  companyName: string;
  jobTitle: string;
  yearsOfExperience: number;
}

export interface IUser extends Document {
  walletAddress: string;
  fullName: string;
  dateOfBirth?: string;
  bio?: string;
  education?: IEducation;
  isWorking: boolean;
  work?: IWork;
  skills: string[];
  following: string[];
  followers: string[];
  profileImage?: string;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  year: { type: Number, required: true },
  fieldOfStudy: { type: String, required: true },
});

const WorkSchema = new Schema<IWork>({
  companyName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  yearsOfExperience: { type: Number, required: true },
});

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: { type: String, default: '' },
    dateOfBirth: { type: String },
    bio: { type: String, default: '' },
    education: { type: EducationSchema },
    isWorking: { type: Boolean, default: false },
    work: { type: WorkSchema },
    skills: [{ type: String }],
    following: [{ type: String }],
    followers: [{ type: String }],
    profileImage: { type: String },
    isOnboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ fullName: 'text', walletAddress: 'text' });

export default mongoose.model<IUser>('User', UserSchema);
