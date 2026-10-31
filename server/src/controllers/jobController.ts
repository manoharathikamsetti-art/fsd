import { Request, Response } from 'express';
import { JobDrive } from '../models/JobDrive';
import { Application } from '../models/Application';

// Get single job drive details with company and applicant count
export const getJobDriveById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const drive = await JobDrive.findById(id).populate('company');
    if (!drive) {
      res.status(404).json({ success: false, message: 'Job Drive not found' });
      return;
    }

    // Compute applicant count from Application records
    const applicantCount = await Application.countDocuments({ jobDrive: drive._id });

    res.status(200).json({
      success: true,
      data: {
        ...drive.toObject(),
        applicantCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching job drive details' });
  }
};

// Get all active job drives
export const getActiveJobDrives = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, department } = req.query;

    const filter: Record<string, any> = { status: 'Active' };
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

    // Dynamically calculate applicant counts
    const driveIds = drives.map((d) => d._id);
    const counts = await Application.aggregate([
      { $match: { jobDrive: { $in: driveIds } } },
      { $group: { _id: '$jobDrive', totalApplicants: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>();
    counts.forEach((c) => countMap.set(c._id.toString(), c.totalApplicants));

    const enrichedDrives = drives.map((d) => ({
      ...d,
      applicantCount: countMap.get(d._id.toString()) || 0,
    }));

    res.status(200).json({
      success: true,
      count: enrichedDrives.length,
      data: enrichedDrives,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching job drives' });
  }
};
