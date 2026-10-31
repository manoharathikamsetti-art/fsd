import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import http from 'http';
import app from '../app';
import { Student } from '../models/Student';
import { PlacementOfficer } from '../models/PlacementOfficer';

// Helper to make local HTTP requests
const makeRequest = (
  serverPort: number,
  method: string,
  urlPath: string,
  body?: any,
  token?: string
): Promise<{ status: number; data: any }> => {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData).toString();
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: serverPort,
        path: urlPath,
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsedData;
          try {
            parsedData = JSON.parse(rawData);
          } catch {
            parsedData = rawData;
          }
          resolve({ status: res.statusCode || 500, data: parsedData });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runVerification = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI missing');
    process.exit(1);
  }

  console.log('🧪 Starting Verification Suite for Accounts & Role-Based Auth...');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log('✅ Connected to MongoDB Atlas.');

  // Start temporary local server on port 5055 to test HTTP endpoints
  const TEST_PORT = 5055;
  const server = app.listen(TEST_PORT);
  console.log(`📡 Test Express server listening on port ${TEST_PORT}\n`);

  let testsPassed = 0;
  let testsFailed = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${detail ? `(${detail})` : ''}`);
      testsPassed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
      testsFailed++;
    }
  };

  try {
    // ---------------------------------------------------------------
    // 1. Verify Database Existence & Password Hashing for Students
    // ---------------------------------------------------------------
    console.log('📋 Test Group 1: Student Accounts Verification in Database');
    const studentRegs = ['24B91A0521', '24B91A0526', '24B91A0559'];
    const studentTokens: Record<string, string> = {};

    for (const regNo of studentRegs) {
      const student = await Student.findOne({ registrationNumber: regNo });
      assert(!!student, `Student ${regNo} exists in database`, student ? student.name : 'Not Found');
      if (student) {
        const isBcrypt = student.password.startsWith('$2a$') || student.password.startsWith('$2b$');
        assert(isBcrypt, `Student ${regNo} password is valid bcrypt hash`);
        const pwdMatches = await student.comparePassword('Password@123');
        assert(pwdMatches, `Student ${regNo} password verifies with comparePassword()`);
      }
    }

    // ---------------------------------------------------------------
    // 2. Verify Database Existence & Password Hashing for Officers
    // ---------------------------------------------------------------
    console.log('\n📋 Test Group 2: Placement Officer Accounts Verification in Database');
    const officerEmails = [
      { email: 'officer1@college.edu', empId: 'TPO-2026-002' },
      { email: 'officer2@college.edu', empId: 'TPO-2026-003' },
    ];
    const officerTokens: Record<string, string> = {};

    for (const off of officerEmails) {
      const officer = await PlacementOfficer.findOne({ email: off.email });
      assert(!!officer, `Officer ${off.email} exists in database`, officer ? `${officer.name} (${officer.employeeId})` : 'Not Found');
      if (officer) {
        assert(officer.employeeId === off.empId, `Officer ${off.email} has Employee ID ${off.empId}`);
        const isBcrypt = officer.password.startsWith('$2a$') || officer.password.startsWith('$2b$');
        assert(isBcrypt, `Officer ${off.email} password is valid bcrypt hash`);
        const pwdMatches = await officer.comparePassword('Password@123');
        assert(pwdMatches, `Officer ${off.email} password verifies with comparePassword()`);
      }
    }

    // ---------------------------------------------------------------
    // 3. Test Authentication HTTP Endpoints (Login Flow)
    // ---------------------------------------------------------------
    console.log('\n📋 Test Group 3: HTTP API Login Verification');

    // Student logins
    for (const regNo of studentRegs) {
      const res = await makeRequest(TEST_PORT, 'POST', '/api/auth/student/login', {
        registrationNumber: regNo,
        password: 'Password@123',
      });
      assert(res.status === 200 && res.data.success === true, `Student Login HTTP 200: ${regNo}`);
      assert(!!res.data.token, `Student ${regNo} received JWT token`);
      assert(res.data.user.role === 'student', `Student ${regNo} user object has role="student"`);
      studentTokens[regNo] = res.data.token;
    }

    // Officer logins
    for (const off of officerEmails) {
      const res = await makeRequest(TEST_PORT, 'POST', '/api/auth/officer/login', {
        email: off.email,
        password: 'Password@123',
      });
      assert(res.status === 200 && res.data.success === true, `Officer Login HTTP 200: ${off.email}`);
      assert(!!res.data.token, `Officer ${off.email} received JWT token`);
      assert(res.data.user.role === 'placement_officer', `Officer ${off.email} user object has role="placement_officer"`);
      officerTokens[off.email] = res.data.token;
    }

    // Test Invalid Login
    const invalidStudentRes = await makeRequest(TEST_PORT, 'POST', '/api/auth/student/login', {
      registrationNumber: '24B91A0521',
      password: 'WrongPassword!',
    });
    assert(invalidStudentRes.status === 401, 'Student Invalid Password correctly rejected with HTTP 401');

    const invalidOfficerRes = await makeRequest(TEST_PORT, 'POST', '/api/auth/officer/login', {
      email: 'officer1@college.edu',
      password: 'WrongPassword!',
    });
    assert(invalidOfficerRes.status === 401, 'Officer Invalid Password correctly rejected with HTTP 401');

    // ---------------------------------------------------------------
    // 4. Role-Based Access Control (RBAC) Verification
    // ---------------------------------------------------------------
    console.log('\n📋 Test Group 4: Role-Based Access Control (RBAC)');

    const sampleStudentToken = studentTokens['24B91A0521'];
    const sampleOfficerToken = officerTokens['officer1@college.edu'];

    // 4a. Student CAN access student endpoints
    const studentProfileRes = await makeRequest(TEST_PORT, 'GET', '/api/students/profile', null, sampleStudentToken);
    assert(studentProfileRes.status === 200, 'Student accessing GET /api/students/profile -> HTTP 200 OK');

    const studentRecRes = await makeRequest(TEST_PORT, 'GET', '/api/students/recommendations', null, sampleStudentToken);
    assert(studentRecRes.status === 200, 'Student accessing GET /api/students/recommendations -> HTTP 200 OK');

    // 4b. Student CANNOT access placement-officer-only endpoints
    const studentAccessOfficerStats = await makeRequest(
      TEST_PORT,
      'GET',
      '/api/placement/dashboard-stats',
      null,
      sampleStudentToken
    );
    assert(
      studentAccessOfficerStats.status === 403,
      'Student attempting GET /api/placement/dashboard-stats -> correctly rejected with HTTP 403 Forbidden'
    );

    const studentAccessOfficerDrives = await makeRequest(
      TEST_PORT,
      'GET',
      '/api/placement/drives',
      null,
      sampleStudentToken
    );
    assert(
      studentAccessOfficerDrives.status === 403,
      'Student attempting GET /api/placement/drives -> correctly rejected with HTTP 403 Forbidden'
    );

    // 4c. Officer CAN access placement-officer endpoints
    const officerStatsRes = await makeRequest(
      TEST_PORT,
      'GET',
      '/api/placement/dashboard-stats',
      null,
      sampleOfficerToken
    );
    assert(officerStatsRes.status === 200, 'Officer accessing GET /api/placement/dashboard-stats -> HTTP 200 OK');
    assert(
      officerStatsRes.data.data.drives.total >= 4,
      'Dashboard stats returns database-derived total drives',
      `Total Drives: ${officerStatsRes.data.data.drives.total}`
    );

    const officerDrivesRes = await makeRequest(
      TEST_PORT,
      'GET',
      '/api/placement/drives',
      null,
      sampleOfficerToken
    );
    assert(officerDrivesRes.status === 200, 'Officer accessing GET /api/placement/drives -> HTTP 200 OK');

    // 4d. Officer CANNOT access student-only endpoints
    const officerAccessStudentSkills = await makeRequest(
      TEST_PORT,
      'GET',
      '/api/students/skills',
      null,
      sampleOfficerToken
    );
    assert(
      officerAccessStudentSkills.status === 403,
      'Officer attempting GET /api/students/skills -> correctly rejected with HTTP 403 Forbidden'
    );

    // 4e. Unauthenticated request rejected
    const noAuthRes = await makeRequest(TEST_PORT, 'GET', '/api/placement/dashboard-stats');
    assert(noAuthRes.status === 401, 'Unauthenticated request to protected route -> correctly rejected with HTTP 401');

    console.log(`\n========================================`);
    console.log(`🏁 Verification Summary: ${testsPassed} Passed, ${testsFailed} Failed`);
    console.log(`========================================\n`);

    server.close();
    await mongoose.disconnect();
    process.exit(testsFailed === 0 ? 0 : 1);
  } catch (error: any) {
    console.error('Fatal error during verification:', error.message);
    server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runVerification();
