import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Student } from '../models/Student';
import { PlacementOfficer } from '../models/PlacementOfficer';
import { AuthenticatedRequest } from '../middleware/auth';

const generateToken = (payload: { id: string; role: 'student' | 'placement_officer'; email?: string; registrationNumber?: string; name?: string }) => {
  const secret = process.env.JWT_SECRET || 'placement_jwt_secret_dev_key_2026_fsd';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

// Student Login
export const studentLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { registrationNumber, password } = req.body;

    if (!registrationNumber || !password) {
      res.status(400).json({
        success: false,
        message: 'Registration number and password are required',
      });
      return;
    }

    const regNoUpper = registrationNumber.trim().toUpperCase();
    const student = await Student.findOne({ registrationNumber: regNoUpper });

    if (!student) {
      res.status(401).json({
        success: false,
        message: 'Invalid registration number or password',
      });
      return;
    }

    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid registration number or password',
      });
      return;
    }

    const token = generateToken({
      id: (student._id as any).toString(),
      role: 'student',
      registrationNumber: student.registrationNumber,
      name: student.name,
    });

    res.status(200).json({
      success: true,
      message: 'Student logged in successfully',
      token,
      user: {
        id: student._id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        collegeEmail: student.collegeEmail,
        personalEmail: student.personalEmail,
        cgpa: student.cgpa,
        phone: student.phone,
        department: student.department,
        batch: student.batch,
        profilePicture: student.profilePicture,
        skills: student.skills,
        role: student.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in student',
    });
  }
};

// Student Registration
export const studentRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      registrationNumber,
      password,
      cgpa,
      phone,
      personalEmail,
      collegeEmail,
      department,
      batch,
      skills,
      profilePicture,
    } = req.body;

    if (!name || !registrationNumber || !password || cgpa === undefined || !phone || !personalEmail || !collegeEmail || !department) {
      res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
      return;
    }

    const regNoUpper = registrationNumber.trim().toUpperCase();

    const existingStudent = await Student.findOne({
      $or: [{ registrationNumber: regNoUpper }, { collegeEmail: collegeEmail.trim().toLowerCase() }],
    });

    if (existingStudent) {
      res.status(409).json({
        success: false,
        message: 'A student with this registration number or college email already exists',
      });
      return;
    }

    const student = new Student({
      name: name.trim(),
      registrationNumber: regNoUpper,
      password,
      cgpa: Number(cgpa),
      phone: phone.trim(),
      personalEmail: personalEmail.trim().toLowerCase(),
      collegeEmail: collegeEmail.trim().toLowerCase(),
      department: department.trim(),
      batch: batch || '2022-2026',
      skills: Array.isArray(skills) ? skills.map((s: string) => s.trim()).filter(Boolean) : [],
      profilePicture: profilePicture || undefined,
    });

    await student.save();

    const token = generateToken({
      id: (student._id as any).toString(),
      role: 'student',
      registrationNumber: student.registrationNumber,
      name: student.name,
    });

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user: {
        id: student._id,
        name: student.name,
        registrationNumber: student.registrationNumber,
        collegeEmail: student.collegeEmail,
        personalEmail: student.personalEmail,
        cgpa: student.cgpa,
        phone: student.phone,
        department: student.department,
        batch: student.batch,
        profilePicture: student.profilePicture,
        skills: student.skills,
        role: student.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering student',
    });
  }
};

// Placement Officer Login
export const officerLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    const emailLower = email.trim().toLowerCase();
    const officer = await PlacementOfficer.findOne({ email: emailLower });

    if (!officer) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const isMatch = await officer.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    const token = generateToken({
      id: (officer._id as any).toString(),
      role: 'placement_officer',
      email: officer.email,
      name: officer.name,
    });

    res.status(200).json({
      success: true,
      message: 'Placement Officer logged in successfully',
      token,
      user: {
        id: officer._id,
        name: officer.name,
        email: officer.email,
        employeeId: officer.employeeId,
        department: officer.department,
        role: officer.role,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in placement officer',
    });
  }
};

// Current authenticated user (Me)
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    if (req.user.role === 'student') {
      const student = await Student.findById(req.user.id).select('-password');
      if (!student) {
        res.status(404).json({ success: false, message: 'Student not found' });
        return;
      }
      res.status(200).json({ success: true, role: 'student', user: student });
      return;
    }

    if (req.user.role === 'placement_officer') {
      const officer = await PlacementOfficer.findById(req.user.id).select('-password');
      if (!officer) {
        res.status(404).json({ success: false, message: 'Officer not found' });
        return;
      }
      res.status(200).json({ success: true, role: 'placement_officer', user: officer });
      return;
    }

    res.status(400).json({ success: false, message: 'Unknown role' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching current user profile',
    });
  }
};
