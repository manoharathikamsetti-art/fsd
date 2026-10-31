import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Student } from '../models/Student';
import { JobDrive } from '../models/JobDrive';
import { Application } from '../models/Application';

// Get student profile
export const getStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.user?.id).select('-password');
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }
    res.status(200).json({ success: true, data: student });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching student profile' });
  }
};

// Update student profile (phone, personalEmail, profilePicture)
export const updateStudentProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { phone, personalEmail, profilePicture } = req.body;
    const student = await Student.findById(req.user?.id);

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    if (phone) student.phone = phone.trim();
    if (personalEmail) student.personalEmail = personalEmail.trim().toLowerCase();
    if (profilePicture) student.profilePicture = profilePicture.trim();

    await student.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: student,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating profile' });
  }
};

// Get student skills
export const getStudentSkills = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.user?.id).select('skills');
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }
    res.status(200).json({ success: true, skills: student.skills });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching skills' });
  }
};

// Update student skills (view, add, edit, remove, save)
export const updateStudentSkills = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      res.status(400).json({ success: false, message: 'Skills must be an array of strings' });
      return;
    }

    // Clean and deduplicate skills
    const cleanedSkills = Array.from(
      new Set(
        skills
          .map((s) => (typeof s === 'string' ? s.trim() : ''))
          .filter((s) => s.length > 0)
      )
    );

    const student = await Student.findByIdAndUpdate(
      req.user?.id,
      { skills: cleanedSkills },
      { new: true, runValidators: true }
    ).select('-password');

    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      skills: student.skills,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error updating skills' });
  }
};

// Skills-based recommendations
export const getRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findById(req.user?.id);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    // Fetch active job drives and populate company
    const drives = await JobDrive.find({ status: 'Active' })
      .populate('company', 'name logoUrl location website tier')
      .lean();

    // Fetch student's existing applications to mark application status
    const existingApps = await Application.find({ student: student._id }).select('jobDrive status');
    const appliedDriveIds = new Map(
      existingApps.map((a) => [(a.jobDrive as any).toString(), a.status])
    );

    // Normalize student skills to lowercase for matching
    const studentSkillsLower = (student.skills || []).map((s) => s.toLowerCase());

    const recommendations = drives.map((drive) => {
      const requiredSkills = drive.requiredSkills || [];
      const requiredSkillsLower = requiredSkills.map((s) => s.toLowerCase());

      const matchingSkills: string[] = [];
      const missingSkills: string[] = [];

      requiredSkills.forEach((skill, index) => {
        const lower = requiredSkillsLower[index];
        if (studentSkillsLower.includes(lower!)) {
          matchingSkills.push(skill);
        } else {
          missingSkills.push(skill);
        }
      });

      const totalRequired = requiredSkills.length;
      const matchScore = totalRequired > 0 ? Math.round((matchingSkills.length / totalRequired) * 100) : 0;

      const isCgpaEligible = student.cgpa >= drive.minCgpa;
      const isDeptEligible =
        !drive.eligibleDepartments ||
        drive.eligibleDepartments.length === 0 ||
        drive.eligibleDepartments.some((d) => d.toLowerCase() === student.department.toLowerCase());

      const isEligible = isCgpaEligible && isDeptEligible;
      const applicationStatus = appliedDriveIds.get((drive._id as any).toString()) || null;

      return {
        ...drive,
        matchScore,
        matchingSkills,
        missingSkills,
        isEligible,
        isCgpaEligible,
        isDeptEligible,
        studentCgpa: student.cgpa,
        applied: appliedDriveIds.has((drive._id as any).toString()),
        applicationStatus,
      };
    });

    // Sort by matchScore descending, then by minPackage descending
    recommendations.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return (b.minPackage || 0) - (a.minPackage || 0);
    });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error generating recommendations' });
  }
};

// Get applied companies / applications for student
export const getStudentApplications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ student: req.user?.id })
      .populate({
        path: 'jobDrive',
        populate: { path: 'company', select: 'name logoUrl location website tier' },
      })
      .populate('company', 'name logoUrl location website tier')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error fetching applied companies' });
  }
};

// Apply to a job drive
export const applyToJobDrive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { jobDriveId } = req.params;
    const { notes, confirmedExternal } = req.body;
    const studentId = req.user?.id;

    const student = await Student.findById(studentId);
    if (!student) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    const drive = await JobDrive.findById(jobDriveId);
    if (!drive) {
      res.status(404).json({ success: false, message: 'Job Drive not found' });
      return;
    }

    if (drive.status !== 'Active') {
      res.status(400).json({ success: false, message: `Cannot apply: Drive is currently ${drive.status}.` });
      return;
    }

    // Eligibility check
    if (student.cgpa < drive.minCgpa) {
      res.status(400).json({
        success: false,
        message: `Ineligible: Minimum required CGPA is ${drive.minCgpa}, but your CGPA is ${student.cgpa}.`,
      });
      return;
    }

    // Check duplicate application
    const existing = await Application.findOne({ student: studentId, jobDrive: jobDriveId });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'You have already submitted an application for this job drive.',
        data: existing,
      });
      return;
    }

    const application = new Application({
      student: student._id,
      jobDrive: drive._id,
      company: drive.company,
      status: 'Applied',
      notes: notes || '',
      externalPortalConfirmed: Boolean(confirmedExternal),
      externalPortalConfirmedAt: confirmedExternal ? new Date() : undefined,
      statusHistory: [
        {
          status: 'Applied',
          updatedAt: new Date(),
          remarks: confirmedExternal
            ? 'Application submitted & external portal completion confirmed by student.'
            : 'Application initiated through student portal.',
        },
      ],
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application registered successfully.',
      data: application,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        message: 'You have already applied for this job drive.',
      });
      return;
    }
    res.status(500).json({ success: false, message: error.message || 'Error applying for job drive' });
  }
};

// Confirm external portal application completion
export const confirmExternalApplication = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { applicationId } = req.params;
    const studentId = req.user?.id;

    const application = await Application.findOne({ _id: applicationId, student: studentId });
    if (!application) {
      res.status(404).json({ success: false, message: 'Application record not found' });
      return;
    }

    application.externalPortalConfirmed = true;
    application.externalPortalConfirmedAt = new Date();
    application.statusHistory.push({
      status: application.status,
      updatedAt: new Date(),
      remarks: 'Student confirmed completion of external company application portal submission.',
      updatedBy: 'Student',
    });

    await application.save();

    res.status(200).json({
      success: true,
      message: 'External portal submission verified and confirmed.',
      data: application,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error confirming external application' });
  }
};
