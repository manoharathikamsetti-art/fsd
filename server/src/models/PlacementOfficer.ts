import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IPlacementOfficer extends Document {
  name: string;
  email: string;
  password: string;
  employeeId: string;
  department: string;
  role: 'placement_officer';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const PlacementOfficerSchema = new Schema<IPlacementOfficer>(
  {
    name: {
      type: String,
      required: [true, 'Officer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Officer email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      default: 'Career Development & Placement Cell',
      trim: true,
    },
    role: {
      type: String,
      enum: ['placement_officer'],
      default: 'placement_officer',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Hash password before saving
PlacementOfficerSchema.pre<IPlacementOfficer>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
PlacementOfficerSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const PlacementOfficer: Model<IPlacementOfficer> = mongoose.model<IPlacementOfficer>(
  'PlacementOfficer',
  PlacementOfficerSchema
);
