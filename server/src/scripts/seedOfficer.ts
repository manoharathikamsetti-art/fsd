import path from 'path';
import dotenv from 'dotenv';

// Support running from server directory or project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import { PlacementOfficer } from '../models/PlacementOfficer';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { JobDrive } from '../models/JobDrive';
import { Application } from '../models/Application';

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not set in environment.');
    process.exit(1);
  }

  try {
    console.log('🌱 Connecting to database for seeding...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB.');

    // ==========================================
    // 1. Seed Placement Officers (Idempotent)
    // ==========================================
    const officersData = [
      {
        name: 'Dr. Ramesh Kumar',
        email: 'placement@college.edu',
        password: 'Password@123',
        employeeId: 'TPO-2026-001',
        department: 'Career Development & Placement Cell',
      },
      {
        name: 'Priya Nambiar',
        email: 'officer1@college.edu',
        password: 'Password@123',
        employeeId: 'TPO-2026-002',
        department: 'Career Development & Placement Cell',
      },
      {
        name: 'Vikramaditya Rao',
        email: 'officer2@college.edu',
        password: 'Password@123',
        employeeId: 'TPO-2026-003',
        department: 'Corporate Relations & Internships',
      },
    ];

    let primaryOfficerDoc = null;

    for (const oData of officersData) {
      let officer = await PlacementOfficer.findOne({
        $or: [{ email: oData.email.toLowerCase() }, { employeeId: oData.employeeId.toUpperCase() }],
      });

      if (!officer) {
        officer = new PlacementOfficer({
          name: oData.name,
          email: oData.email.toLowerCase(),
          password: oData.password,
          employeeId: oData.employeeId.toUpperCase(),
          department: oData.department,
        });
        await officer.save();
        console.log(`✅ Placement Officer created: ${officer.email} (${officer.employeeId})`);
      } else {
        console.log(`ℹ️ Placement Officer already exists: ${officer.email} (${officer.employeeId})`);
      }

      if (!primaryOfficerDoc) {
        primaryOfficerDoc = officer;
      }
    }

    // ==========================================
    // 2. Seed Students (Idempotent)
    // ==========================================
    const studentsData = [
      {
        name: 'Aarav Sharma',
        registrationNumber: '22CS101',
        password: 'Password@123',
        cgpa: 8.75,
        phone: '+91 98765 43210',
        personalEmail: 'aarav.sharma@example.com',
        collegeEmail: '22cs101@college.edu',
        department: 'Computer Science & Engineering',
        batch: '2022-2026',
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Python', 'Data Structures'],
        profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      },
      {
        name: 'Sai Teja Reddy',
        registrationNumber: '24B91A0521',
        password: 'Password@123',
        cgpa: 8.45,
        phone: '+91 98480 12345',
        personalEmail: 'saiteja.24b91a0521@gmail.com',
        collegeEmail: '24b91a0521@college.edu',
        department: 'Computer Science & Engineering',
        batch: '2024-2028',
        skills: ['Java', 'Python', 'SQL', 'Data Structures', 'Spring Boot'],
        profilePicture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
      },
      {
        name: 'Ananya Verma',
        registrationNumber: '24B91A0526',
        password: 'Password@123',
        cgpa: 9.1,
        phone: '+91 98480 23456',
        personalEmail: 'ananya.24b91a0526@gmail.com',
        collegeEmail: '24b91a0526@college.edu',
        department: 'Computer Science & Engineering',
        batch: '2024-2028',
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      },
      {
        name: 'Karthik Varma',
        registrationNumber: '24B91A0559',
        password: 'Password@123',
        cgpa: 7.85,
        phone: '+91 98480 34567',
        personalEmail: 'karthik.24b91a0559@gmail.com',
        collegeEmail: '24b91a0559@college.edu',
        department: 'Computer Science & Engineering',
        batch: '2024-2028',
        skills: ['C++', 'Python', 'Algorithms', 'Machine Learning', 'Git'],
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      },
    ];

    let demoStudentDoc = null;

    for (const sData of studentsData) {
      let student = await Student.findOne({
        $or: [
          { registrationNumber: sData.registrationNumber.toUpperCase() },
          { collegeEmail: sData.collegeEmail.toLowerCase() },
        ],
      });

      if (!student) {
        student = new Student({
          name: sData.name,
          registrationNumber: sData.registrationNumber.toUpperCase(),
          password: sData.password,
          cgpa: sData.cgpa,
          phone: sData.phone,
          personalEmail: sData.personalEmail.toLowerCase(),
          collegeEmail: sData.collegeEmail.toLowerCase(),
          department: sData.department,
          batch: sData.batch,
          skills: sData.skills,
          profilePicture: sData.profilePicture,
        });
        await student.save();
        console.log(`✅ Student created: ${student.registrationNumber} (${student.name})`);
      } else {
        console.log(`ℹ️ Student already exists: ${student.registrationNumber} (${student.name})`);
      }

      if (!demoStudentDoc) {
        demoStudentDoc = student;
      }
    }

    // ==========================================
    // 3. Seed Companies (Idempotent)
    // ==========================================
    const companiesData = [
      {
        name: 'Google India',
        website: 'https://careers.google.com',
        industry: 'Software & Cloud Services',
        description:
          'Global technology leader specializing in search, cloud computing, AI, and advertising technologies.',
        location: 'Bengaluru / Hyderabad',
        logoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=150',
        tier: 'Super Dream' as const,
        contactEmail: 'campus-in@google.com',
        contactPhone: '+91 80 6721 8000',
      },
      {
        name: 'Microsoft IDC',
        website: 'https://careers.microsoft.com',
        industry: 'Cloud & Enterprise Computing',
        description:
          'Empowering every person and organization on the planet to achieve more through world-class software.',
        location: 'Hyderabad / Noida',
        logoUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=150',
        tier: 'Super Dream' as const,
        contactEmail: 'university-india@microsoft.com',
        contactPhone: '+91 40 6695 0000',
      },
      {
        name: 'Amazon Development Centre',
        website: 'https://amazon.jobs',
        industry: 'E-Commerce & Cloud (AWS)',
        description:
          'Pioneering customer-centric services, large-scale distributed cloud systems, and logistics technology.',
        location: 'Bengaluru / Chennai',
        logoUrl: 'https://images.unsplash.com/photo-1523474255658-406167bfceb7?auto=format&fit=crop&q=80&w=150',
        tier: 'Dream' as const,
        contactEmail: 'campus-recruiting@amazon.com',
        contactPhone: '+91 80 4108 8000',
      },
      {
        name: 'TCS Digital',
        website: 'https://www.tcs.com/careers',
        industry: 'IT Consulting & Services',
        description:
          'Leading global IT services, consulting, and business solutions organization offering advanced digital roles.',
        location: 'Pan India',
        logoUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=150',
        tier: 'Core' as const,
        contactEmail: 'campus@tcs.com',
        contactPhone: '+91 22 6778 9999',
      },
    ];

    const companyMap: Record<string, any> = {};
    for (const cData of companiesData) {
      let company = await Company.findOne({ name: cData.name });
      if (!company) {
        company = new Company(cData);
        await company.save();
        console.log(`✅ Company created: ${company.name}`);
      } else {
        console.log(`ℹ️ Company already exists: ${company.name}`);
      }
      companyMap[company.name] = company;
    }

    // ==========================================
    // 4. Seed Job Drives (Idempotent)
    // ==========================================
    const drivesData = [
      {
        company: companyMap['Google India']._id,
        companyName: 'Google India',
        jobRole: 'Associate Software Engineer (Cloud & AI)',
        description:
          'Join the core cloud infrastructure and AI engineering team. Work on distributed systems, scalable microservices, and high-performance algorithms.',
        intakes: 12,
        packageRange: '32.0 - 45.0 LPA',
        minPackage: 32.0,
        maxPackage: 45.0,
        requiredSkills: ['Data Structures', 'Algorithms', 'TypeScript', 'Node.js', 'Distributed Systems'],
        minCgpa: 8.0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        status: 'Active' as const,
        applicationUrl: 'https://careers.google.com/jobs/results/?q=software%20engineer',
        driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: primaryOfficerDoc?._id,
      },
      {
        company: companyMap['Microsoft IDC']._id,
        companyName: 'Microsoft IDC',
        jobRole: 'Software Engineer - Azure Core',
        description:
          'Design and build next-generation Azure cloud components. Looking for strong fundamentals in full-stack web technologies, OS concepts, and database systems.',
        intakes: 18,
        packageRange: '28.0 - 38.0 LPA',
        minPackage: 28.0,
        maxPackage: 38.0,
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'Cloud Computing', 'SQL'],
        minCgpa: 7.5,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
        status: 'Active' as const,
        applicationUrl: 'https://careers.microsoft.com/us/en/search-results',
        driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: primaryOfficerDoc?._id,
      },
      {
        company: companyMap['Amazon Development Centre']._id,
        companyName: 'Amazon Development Centre',
        jobRole: 'Full Stack SDE 1',
        description:
          'Build customer-facing web services and highly scalable backend APIs using React, Node.js, and MongoDB / AWS DynamoDB.',
        intakes: 25,
        packageRange: '24.0 - 32.0 LPA',
        minPackage: 24.0,
        maxPackage: 32.0,
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'REST APIs'],
        minCgpa: 7.0,
        eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
        status: 'Active' as const,
        applicationUrl: 'https://amazon.jobs/en/job_categories/software-development',
        driveDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        createdBy: primaryOfficerDoc?._id,
      },
      {
        company: companyMap['TCS Digital']._id,
        companyName: 'TCS Digital',
        jobRole: 'Systems Engineer - Digital & Analytics',
        description:
          'Enterprise solution engineering across modern web technologies, full-stack JavaScript, and enterprise cloud migrations.',
        intakes: 60,
        packageRange: '7.5 - 9.5 LPA',
        minPackage: 7.5,
        maxPackage: 9.5,
        requiredSkills: ['JavaScript', 'Python', 'SQL', 'Web Development'],
        minCgpa: 6.5,
        eligibleDepartments: [
          'Computer Science & Engineering',
          'Information Technology',
          'Electronics & Communication',
          'Mechanical Engineering',
        ],
        status: 'Active' as const,
        applicationUrl: 'https://www.tcs.com/careers/india/entry-level-hiring',
        driveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdBy: primaryOfficerDoc?._id,
      },
    ];

    for (const dData of drivesData) {
      const existing = await JobDrive.findOne({
        company: dData.company,
        jobRole: dData.jobRole,
      });
      if (!existing) {
        const drive = new JobDrive(dData);
        await drive.save();
        console.log(`✅ Job Drive created: ${drive.companyName} - ${drive.jobRole}`);
      } else {
        console.log(`ℹ️ Job Drive already exists: ${dData.companyName} - ${dData.jobRole}`);
      }
    }

    // ==========================================
    // 5. Seed a sample application (Idempotent)
    // ==========================================
    const firstDrive = await JobDrive.findOne({ companyName: 'Amazon Development Centre' });
    if (firstDrive && demoStudentDoc) {
      const existingApp = await Application.findOne({
        student: demoStudentDoc._id,
        jobDrive: firstDrive._id,
      });
      if (!existingApp) {
        const app = new Application({
          student: demoStudentDoc._id,
          jobDrive: firstDrive._id,
          company: firstDrive.company,
          status: 'Under Review',
          notes: 'Submitted resume and portfolio link.',
          externalPortalConfirmed: true,
          externalPortalConfirmedAt: new Date(),
          statusHistory: [
            {
              status: 'Applied',
              updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
              remarks: 'Applied through student portal.',
            },
            {
              status: 'Under Review',
              updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
              remarks: 'Resume forwarded to technical hiring team.',
            },
          ],
        });
        await app.save();
        console.log(`✅ Demo Application created for student ${demoStudentDoc.registrationNumber} at Amazon.`);
      } else {
        console.log(`ℹ️ Demo Application already exists for student ${demoStudentDoc.registrationNumber}.`);
      }
    }

    console.log('\n🎉 Database seeding finished successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error during seeding:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedDatabase();
