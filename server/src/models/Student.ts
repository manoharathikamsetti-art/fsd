import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
  name: string;
  registrationNumber: string;
  password: string;
  cgpa: number;
  phone: string;
  personalEmail: string;
  collegeEmail: string;
  department: string;
  batch: string;
  profilePicture: string;
  skills: string[];
  role: 'student';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    cgpa: {
      type: Number,
      required: [true, 'CGPA is required'],
      min: [0, 'CGPA cannot be negative'],
      max: [10, 'CGPA cannot exceed 10.0'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    personalEmail: {
      type: String,
      required: [true, 'Personal email is required'],
      lowercase: true,
      trim: true,
    },
    collegeEmail: {
      type: String,
      required: [true, 'College email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    batch: {
      type: String,
      default: '2022-2026',
      trim: true,
    },
    profilePicture: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    },
    skills: {
      type: [String],
      default: [],
    },
    role: {
      type: String,
      enum: ['student'],
      default: 'student',
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
StudentSchema.pre<IStudent>('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
StudentSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const Student: Model<IStudent> = mongoose.model<IStudent>('Student', StudentSchema);
