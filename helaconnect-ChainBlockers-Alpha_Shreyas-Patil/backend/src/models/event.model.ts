import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  location: string;
  address: string;
  date: string;
  time: string;
  type: 'workshop' | 'conference' | 'meetup' | 'webinar' | 'hackathon' | 'other';
  tags: string[];
  organizer: string;
  sourceUrl: string;
  source: string;
  imageUrl?: string;
  isFree: boolean;
  price?: string;
  isActive: boolean;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: 'Remote' },
    address: { type: String, default: 'Online' },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    type: {
      type: String,
      enum: ['workshop', 'conference', 'meetup', 'webinar', 'hackathon', 'other'],
      default: 'other',
    },
    tags: [{ type: String }],
    organizer: { type: String, default: 'Admin' },
    sourceUrl: { type: String, default: '#' },
    source: { type: String, default: 'Admin' },
    imageUrl: { type: String },
    isFree: { type: Boolean, default: true },
    price: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EventSchema.index({ title: 'text', description: 'text', location: 'text' });

export default mongoose.model<IEvent>('Event', EventSchema);
