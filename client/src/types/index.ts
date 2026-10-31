export type UserRole = 'student' | 'placement_officer';

export interface StudentUser {
  id: string;
  name: string;
  registrationNumber: string;
  collegeEmail: string;
  personalEmail: string;
  cgpa: number;
  phone: string;
  department: string;
  batch: string;
  profilePicture: string;
  skills: string[];
  role: 'student';
}

export interface OfficerUser {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  department: string;
  role: 'placement_officer';
}

export interface Company {
  _id: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  location?: string;
  logoUrl?: string;
  tier?: 'Dream' | 'Super Dream' | 'Core' | 'Regular';
  contactEmail?: string;
  contactPhone?: string;
}

export interface JobDrive {
  _id: string;
  company: Company | string;
  companyName: string;
  jobRole: string;
  description: string;
  intakes: number;
  packageRange: string;
  minPackage?: number;
  maxPackage?: number;
  requiredSkills: string[];
  minCgpa: number;
  eligibleDepartments: string[];
  status: 'Upcoming' | 'Active' | 'Completed' | 'Closed';
  applicationUrl: string;
  driveDate?: string;
  deadline?: string;
  applicantCount?: number;
  selectedCount?: number;
  confirmedExternalCount?: number;
  createdAt: string;
}

export interface RecommendedJobDrive extends JobDrive {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  isEligible: boolean;
  isCgpaEligible: boolean;
  isDeptEligible: boolean;
  studentCgpa: number;
  applied: boolean;
  applicationStatus?: string | null;
}

export type ApplicationStatus =
  | 'Applied'
  | 'Under Review'
  | 'Shortlisted'
  | 'Interview Scheduled'
  | 'Selected'
  | 'Rejected';

export interface StatusHistoryItem {
  status: ApplicationStatus;
  updatedAt: string;
  remarks?: string;
  updatedBy?: string;
}

export interface ApplicationRecord {
  _id: string;
  student: StudentUser | any;
  jobDrive: JobDrive | any;
  company: Company | any;
  status: ApplicationStatus;
  notes?: string;
  externalPortalConfirmed: boolean;
  externalPortalConfirmedAt?: string;
  statusHistory: StatusHistoryItem[];
  appliedAt: string;
  createdAt: string;
}

export interface DashboardStats {
  drives: {
    total: number;
    active: number;
    upcoming: number;
    completed: number;
  };
  students: {
    total: number;
  };
  companies: {
    total: number;
  };
  applications: {
    total: number;
    applied: number;
    underReview: number;
    shortlisted: number;
    interviewScheduled: number;
    selected: number;
    rejected: number;
  };
  departmentStats: Array<{
    _id: string;
    totalStudents: number;
    avgCgpa: number;
  }>;
  topCompanies: Array<{
    companyName: string;
    tier: string;
    applicationCount: number;
    selectedCount: number;
  }>;
}
