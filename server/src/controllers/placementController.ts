import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { JobDrive } from '../models/JobDrive';
import { Company } from '../models/Company';
import { Student } from '../models/Student';
import { Application, ApplicationStatus } from '../models/Application';
import mongoose from 'mongoose';

// Dashboard statistics derived from actual database records
export const getDashboardStats = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalDrives = await JobDrive.countDocuments();
    const activeDrives = await JobDrive.countDocuments({ status: 'Active' });
    const upcomingDrives = await JobDrive.countDocuments({ status: 'Upcoming' });
    const completedDrives = await JobDrive.countDocuments({ status: 'Completed' });

    const totalStudents = await Student.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Application status breakdown
    const selectedCount = await Application.countDocuments({ status: 'Selected' });
    const shortlistedCount = await Application.countDocuments({ status: 'Shortlisted' });
    const interviewCount = await Application.countDocuments({ status: 'Interview Scheduled' });
    const underReviewCount = await Application.countDocuments({ status: 'Under Review' });
    const appliedCount = await Application.countDocuments({ status: 'Applied' });
    const rejectedCount = await Application.countDocuments({ status: 'Rejected' });

    // MongoDB Aggregation: Department-wise student count and placement statistics
    const deptStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          totalStudents: { $sum: 1 },
          avgCgpa: { $avg: '$cgpa' },
        },
      },
      { $sort: { totalStudents: -1 } },
    ]);

    // MongoDB Aggregation: Applications per company
    const companyAppStats = await Application.aggregate([
      {
        $group: {
          _id: '$company',
          applicationCount: { $sum: 1 },
          selectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Selected'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'companies',
          localField: '_id',
          foreignField: '_id',
          as: 'companyDetails',
        },
      },
      { $unwind: { path: '$companyDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          companyName: '$companyDetails.name',
          tier: '$companyDetails.tier',
          applicationCount: 1,
          selectedCount: 1,
        },
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        drives: {
          total: totalDrives,
          active: activeDrives,
          upcoming: upcomingDrives,
          completed: completedDrives,
        },
        students: {
          total: totalStudents,
        },
        companies: {
          total: totalCompanies,
        },
        applications: {
          total: totalApplications,
          applied: appliedCount,
          underReview: underReviewCount,
          shortlisted: shortlistedCount,
          interviewScheduled: interviewCount,
          selected: selectedCount,
          rejected: rejectedCount,
        },
        departmentStats: deptStats,
        topCompanies: companyAppStats,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching placement dashboard stats' });
  }
};

// Get all Job Drives with dynamically computed enrolled applicant count
export const getAllJobDrives = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, search, department } = req.query;

    const filter: Record<string, any> = {};
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (department && department !== 'All') {
      filter.eligibleDepartments = { $in: [department] };
    }
    if (search) {
      filter.$or = [
        { jobRole: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    const drives = await JobDrive.find(filter)
      .populate('company', 'name logoUrl location website tier')
      .sort({ createdAt: -1 })
      .lean();

    // Dynamically calculate applicant counts from actual Application records
    // Enrolled applicants must NEVER be manually editable.
    const driveIds = drives.map((d) => d._id);
    const counts = await Application.aggregate([
      { $match: { jobDrive: { $in: driveIds } } },
      {
        $group: {
          _id: '$jobDrive',
          totalApplicants: { $sum: 1 },
          selectedApplicants: {
            $sum: { $cond: [{ $eq: ['$status', 'Selected'] }, 1, 0] },
          },
          confirmedExternalCount: {
            $sum: { $cond: [{ $eq: ['$externalPortalConfirmed', true] }, 1, 0] },
          },
        },
      },
    ]);

    const countMap = new Map<string, { total: number; selected: number; confirmedExternal: number }>();
    counts.forEach((c) => {
      countMap.set(c._id.toString(), {
        total: c.totalApplicants,
        selected: c.selectedApplicants,
        confirmedExternal: c.confirmedExternalCount,
      });
    });

    const drivesWithApplicants = drives.map((d) => {
      const stats = countMap.get(d._id.toString()) || { total: 0, selected: 0, confirmedExternal: 0 };
      return {
        ...d,
        applicantCount: stats.total, // strictly derived from Application records
        selectedCount: stats.selected,
        confirmedExternalCount: stats.confirmedExternal,
      };
    });

    res.status(200).json({
      success: true,
      count: drivesWithApplicants.length,
      data: drivesWithApplicants,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching job drives' });
  }
};

// Create a new Job Drive (and company if not existing)
export const createJobDrive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      companyId,
      companyName,
      jobRole,
      description,
      intakes,
      packageRange,
      minPackage,
      maxPackage,
      requiredSkills,
      minCgpa,
      eligibleDepartments,
      status,
      applicationUrl,
      driveDate,
      deadline,
    } = req.body;

    if (!jobRole || !description || !intakes || !packageRange || !requiredSkills || minCgpa === undefined || !applicationUrl) {
      res.status(400).json({
        success: false,
        message: 'Required fields missing: jobRole, description, intakes, packageRange, requiredSkills, minCgpa, applicationUrl',
      });
      return;
    }

    let finalCompanyId = companyId;
    let finalCompanyName = companyName;

    if (!finalCompanyId) {
      if (!companyName) {
        res.status(400).json({ success: false, message: 'Either companyId or companyName is required' });
        return;
      }
      let existingCompany = await Company.findOne({ name: companyName.trim() });
      if (!existingCompany) {
        existingCompany = new Company({
          name: companyName.trim(),
          industry: req.body.industry || 'Information Technology',
          tier: req.body.tier || 'Core',
          website: req.body.website || '',
        });
        await existingCompany.save();
      }
      finalCompanyId = existingCompany._id;
      finalCompanyName = existingCompany.name;
    } else {
      const existingCompany = await Company.findById(finalCompanyId);
      if (existingCompany) {
        finalCompanyName = existingCompany.name;
      }
    }

    const skillsArray = Array.isArray(requiredSkills)
      ? requiredSkills.map((s: string) => s.trim()).filter(Boolean)
      : String(requiredSkills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

    const deptsArray = Array.isArray(eligibleDepartments)
      ? eligibleDepartments.map((d: string) => d.trim()).filter(Boolean)
      : String(eligibleDepartments || '')
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean);

    const drive = new JobDrive({
      company: finalCompanyId,
      companyName: finalCompanyName,
      jobRole: jobRole.trim(),
      description: description.trim(),
      intakes: Number(intakes),
      packageRange: packageRange.trim(),
      minPackage: Number(minPackage) || 0,
      maxPackage: Number(maxPackage) || 0,
      requiredSkills: skillsArray,
      minCgpa: Number(minCgpa),
      eligibleDepartments: deptsArray.length > 0 ? deptsArray : ['Computer Science & Engineering', 'Information Technology'],
      status: status || 'Active',
      applicationUrl: applicationUrl.trim(),
      driveDate: driveDate ? new Date(driveDate) : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      createdBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
    });

    await drive.save();

    res.status(201).json({
      success: true,
      message: 'Job Drive created successfully',
      data: drive,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating job drive' });
  }
};

// Update an existing Job Drive
export const updateJobDrive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      jobRole,
      description,
      intakes,
      packageRange,
      minPackage,
      maxPackage,
      requiredSkills,
      minCgpa,
      eligibleDepartments,
      status,
      applicationUrl,
      driveDate,
      deadline,
    } = req.body;

    const drive = await JobDrive.findById(id);
    if (!drive) {
      res.status(404).json({ success: false, message: 'Job Drive not found' });
      return;
    }

    if (jobRole) drive.jobRole = jobRole.trim();
    if (description) drive.description = description.trim();
    if (intakes !== undefined) drive.intakes = Number(intakes);
    if (packageRange) drive.packageRange = packageRange.trim();
    if (minPackage !== undefined) drive.minPackage = Number(minPackage);
    if (maxPackage !== undefined) drive.maxPackage = Number(maxPackage);
    if (minCgpa !== undefined) drive.minCgpa = Number(minCgpa);
    if (status) drive.status = status;
    if (applicationUrl) drive.applicationUrl = applicationUrl.trim();
    if (driveDate !== undefined) drive.driveDate = driveDate ? new Date(driveDate) : undefined;
    if (deadline !== undefined) drive.deadline = deadline ? new Date(deadline) : undefined;

    if (requiredSkills) {
      drive.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills.map((s: string) => s.trim()).filter(Boolean)
        : String(requiredSkills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (eligibleDepartments) {
      drive.eligibleDepartments = Array.isArray(eligibleDepartments)
        ? eligibleDepartments.map((d: string) => d.trim()).filter(Boolean)
        : String(eligibleDepartments)
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean);
    }

    await drive.save();

    res.status(200).json({
      success: true,
      message: 'Job Drive updated successfully',
      data: drive,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating job drive' });
  }
};

// Delete a Job Drive
export const deleteJobDrive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const drive = await JobDrive.findByIdAndDelete(id);
    if (!drive) {
      res.status(404).json({ success: false, message: 'Job Drive not found' });
      return;
    }
    // Also remove associated applications
    await Application.deleteMany({ jobDrive: id });

    res.status(200).json({
      success: true,
      message: 'Job Drive and associated applications removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error deleting job drive' });
  }
};

// Manage Application Records (List, filter, search)
export const getAllApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobDriveId, status, department, search } = req.query;

    const filter: Record<string, any> = {};
    if (jobDriveId && jobDriveId !== 'All') {
      filter.jobDrive = jobDriveId;
    }
    if (status && status !== 'All') {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('student', 'name registrationNumber cgpa department phone collegeEmail personalEmail skills')
      .populate('jobDrive', 'jobRole companyName packageRange minCgpa status applicationUrl')
      .populate('company', 'name tier location logoUrl')
      .sort({ appliedAt: -1 })
      .lean();

    // In-memory filter for student department or search term if populated
    let filtered = applications;
    if (department && department !== 'All') {
      filtered = filtered.filter(
        (app: any) => app.student?.department?.toLowerCase() === String(department).toLowerCase()
      );
    }

    if (search) {
      const q = String(search).toLowerCase();
      filtered = filtered.filter(
        (app: any) =>
          app.student?.name?.toLowerCase().includes(q) ||
          app.student?.registrationNumber?.toLowerCase().includes(q) ||
          app.jobDrive?.companyName?.toLowerCase().includes(q) ||
          app.jobDrive?.jobRole?.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching applications' });
  }
};

// Update Application Status
export const updateApplicationStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses: ApplicationStatus[] = [
      'Applied',
      'Under Review',
      'Shortlisted',
      'Interview Scheduled',
      'Selected',
      'Rejected',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const application = await Application.findById(id);
    if (!application) {
      res.status(404).json({ success: false, message: 'Application record not found' });
      return;
    }

    application.status = status;
    application.statusHistory.push({
      status,
      updatedAt: new Date(),
      remarks: remarks || `Status updated to ${status} by Placement Cell`,
      updatedBy: req.user?.name || 'Placement Officer',
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating application status' });
  }
};

// Company management
export const getAllCompanies = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching companies' });
  }
};

export const createCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, website, industry, description, location, logoUrl, tier, contactEmail, contactPhone } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Company name is required' });
      return;
    }

    const existing = await Company.findOne({ name: name.trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A company with this name already exists' });
      return;
    }

    const company = new Company({
      name: name.trim(),
      website: website || '',
      industry: industry || 'Information Technology',
      description: description || '',
      location: location || '',
      logoUrl: logoUrl || undefined,
      tier: tier || 'Core',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
    });

    await company.save();

    res.status(201).json({ success: true, message: 'Company created successfully', data: company });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating company' });
  }
};
