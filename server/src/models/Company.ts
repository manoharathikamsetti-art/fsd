import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  website: string;
  industry: string;
  description: string;
  location: string;
  logoUrl: string;
  tier: 'Dream' | 'Super Dream' | 'Core' | 'Regular';
  contactEmail: string;
  contactPhone: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      unique: true,
      trim: true,
      index: true,
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    industry: {
      type: String,
      default: 'Information Technology',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: 'Bengaluru / Hyderabad / Remote',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&q=80&w=150',
    },
    tier: {
      type: String,
      enum: ['Dream', 'Super Dream', 'Core', 'Regular'],
      default: 'Core',
    },
    contactEmail: {
      type: String,
      default: '',
      trim: true,
    },
    contactPhone: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Company: Model<ICompany> = mongoose.model<ICompany>('Company', CompanySchema);
