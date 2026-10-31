import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected';

export interface IStatusHistory {
  status: ApplicationStatus;
  updatedAt: Date;
  remarks?: string;
  updatedBy?: string;
}

export interface IApplication extends Document {
  student: Types.ObjectId;
  jobDrive: Types.ObjectId;
  company: Types.ObjectId;
  status: ApplicationStatus;
  notes?: string;
  externalPortalConfirmed: boolean;
  externalPortalConfirmedAt?: Date;
  statusHistory: IStatusHistory[];
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    jobDrive: {
      type: Schema.Types.ObjectId,
      ref: 'JobDrive',
      required: [true, 'Job Drive reference is required'],
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'],
      default: 'Applied',
      index: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    externalPortalConfirmed: {
      type: Boolean,
      default: false,
    },
    externalPortalConfirmedAt: {
      type: Date,
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'],
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
        remarks: {
          type: String,
          default: '',
        },
        updatedBy: {
          type: String,
          default: 'System',
        },
      },
    ],
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active applications: A student can apply to a given job drive only once.
ApplicationSchema.index({ student: 1, jobDrive: 1 }, { unique: true });

export const Application: Model<IApplication> = mongoose.model<IApplication>(
  'Application',
  ApplicationSchema
);
