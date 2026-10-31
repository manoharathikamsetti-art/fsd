import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IJobDrive extends Document {
  company: Types.ObjectId;
  companyName: string;
  jobRole: string;
  description: string;
  intakes: number;
  packageRange: string;
  minPackage: number;
  maxPackage: number;
  requiredSkills: string[];
  minCgpa: number;
  eligibleDepartments: string[];
  status: 'Upcoming' | 'Active' | 'Completed' | 'Closed';
  applicationUrl: string;
  driveDate?: Date;
  deadline?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobDriveSchema = new Schema<IJobDrive>(
  {
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Associated company is required'],
      index: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobRole: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
    },
    intakes: {
      type: Number,
      required: [true, 'Intake count is required'],
      min: [1, 'Intakes must be at least 1'],
    },
    packageRange: {
      type: String,
      required: [true, 'Package range is required (e.g. 8 - 12 LPA)'],
      trim: true,
    },
    minPackage: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPackage: {
      type: Number,
      default: 0,
      min: 0,
    },
    requiredSkills: {
      type: [String],
      required: [true, 'At least one required skill must be specified'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'At least one skill is required',
      },
    },
    minCgpa: {
      type: Number,
      required: [true, 'Minimum CGPA eligibility is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
      default: 6.0,
    },
    eligibleDepartments: {
      type: [String],
      default: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed', 'Closed'],
      default: 'Active',
      index: true,
    },
    applicationUrl: {
      type: String,
      required: [true, 'External application portal URL is required'],
      trim: true,
    },
    driveDate: {
      type: Date,
    },
    deadline: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'PlacementOfficer',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful indexes for queries
JobDriveSchema.index({ status: 1, minCgpa: 1 });
JobDriveSchema.index({ createdAt: -1 });

export const JobDrive: Model<IJobDrive> = mongoose.model<IJobDrive>('JobDrive', JobDriveSchema);
