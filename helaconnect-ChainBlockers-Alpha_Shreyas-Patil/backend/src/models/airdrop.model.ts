import mongoose, { Document, Schema } from 'mongoose';

export interface IAirdrop extends Document {
  title: string;
  description: string;
  reward: string;
  endDate: string;
  participationLink: string;
  isActive: boolean;
  createdAt: Date;
}

const AirdropSchema = new Schema<IAirdrop>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    reward: { type: String, required: true },
    endDate: { type: String, required: true },
    participationLink: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAirdrop>('Airdrop', AirdropSchema);
