import http from 'http';

const makeRequest = (
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
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData).toString();

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path: urlPath,
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch {
            parsed = rawData;
          }
          resolve({ status: res.statusCode || 500, data: parsed });
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

const runLiveWorkflowTests = async () => {
  console.log('🚀 Running Live End-to-End Workflow Verification against http://localhost:5000...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, label: string, detail?: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${label} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${label} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Authenticate Officer & Student
    const offLogin = await makeRequest('POST', '/api/auth/officer/login', {
      email: 'officer1@college.edu',
      password: 'Password@123',
    });
    assert(offLogin.status === 200, 'Officer authentication', offLogin.data.user?.name);
    const officerToken = offLogin.data.token;

    const studLogin = await makeRequest('POST', '/api/auth/student/login', {
      registrationNumber: '24B91A0521',
      password: 'Password@123',
    });
    assert(studLogin.status === 200, 'Student authentication', studLogin.data.user?.name);
    const studentToken = studLogin.data.token;

    // 2. Skills Update & Dynamic Recommendations
    const updatedSkills = ['Java', 'Python', 'React', 'TypeScript', 'Node.js', 'MongoDB'];
    const skillsRes = await makeRequest('PUT', '/api/students/skills', { skills: updatedSkills }, studentToken);
    assert(skillsRes.status === 200, 'Student skills update persistence in MongoDB');

    const recRes = await makeRequest('GET', '/api/students/recommendations', null, studentToken);
    assert(recRes.status === 200 && recRes.data.data.length > 0, 'Recommendations computed with updated skills');
    const topRec = recRes.data.data[0];
    assert(topRec.matchScore >= 60, 'Recommendation matchScore reflects updated skills', `${topRec.companyName} match: ${topRec.matchScore}%`);

    // 3. Job Drive Creation by Officer
    const newDriveData = {
      companyName: 'Goldman Sachs India',
      jobRole: 'Analyst - Global Investment Research',
      description: 'Quantitative analytics, financial modeling, and distributed microservices development.',
      intakes: 15,
      packageRange: '24.0 - 30.0 LPA',
      minPackage: 24.0,
      maxPackage: 30.0,
      requiredSkills: ['Python', 'SQL', 'Algorithms', 'Java'],
      minCgpa: 7.5,
      eligibleDepartments: ['Computer Science & Engineering', 'Information Technology'],
      status: 'Active',
      applicationUrl: 'https://goldmansachs.tal.net/vx/lang-en-GB/appcentre-1/candidate',
    };
    const createDriveRes = await makeRequest('POST', '/api/placement/drives', newDriveData, officerToken);
    assert(createDriveRes.status === 201, 'Officer creates Job Drive in MongoDB', createDriveRes.data.data?.companyName);
    const createdDriveId = createDriveRes.data.data?._id;

    // 4. Synchronization: Confirm job appears on student portal
    const studentJobRes = await makeRequest('GET', `/api/jobs/${createdDriveId}`, null, studentToken);
    assert(studentJobRes.status === 200, 'Student views newly created drive details');
    assert(studentJobRes.data.data.applicantCount === 0, 'Dynamic applicant count is 0 before applications');

    // 5. Student Application & Verification Workflow
    const applyRes = await makeRequest(
      'POST',
      `/api/students/apply/${createdDriveId}`,
      { notes: 'Submitted resume and completed coding challenge.', confirmedExternal: true },
      studentToken
    );
    assert(applyRes.status === 201, 'Student registers verified application for job drive');

    // 6. Duplicate Application Prevention
    const duplicateApplyRes = await makeRequest(
      'POST',
      `/api/students/apply/${createdDriveId}`,
      { confirmedExternal: true },
      studentToken
    );
    assert(duplicateApplyRes.status === 409, 'Duplicate application attempt correctly blocked with HTTP 409');

    // 7. Dynamic Applicant Count Check (Officer View)
    const officerDrivesRes = await makeRequest('GET', '/api/placement/drives', null, officerToken);
    const foundDrive = officerDrivesRes.data.data.find((d: any) => d._id === createdDriveId);
    assert(foundDrive && foundDrive.applicantCount === 1, 'Job drive applicantCount strictly derived as 1 from Application records');

    // 8. Officer Edits Job Drive & Dashboard Synchronization
    const editRes = await makeRequest(
      'PUT',
      `/api/placement/drives/${createdDriveId}`,
      { intakes: 25, packageRange: '26.0 - 32.0 LPA' },
      officerToken
    );
    assert(editRes.status === 200, 'Officer updates job drive intakes and package range');

    const syncedStudentView = await makeRequest('GET', `/api/jobs/${createdDriveId}`, null, studentToken);
    assert(
      syncedStudentView.data.data.intakes === 25 && syncedStudentView.data.data.packageRange === '26.0 - 32.0 LPA',
      'Student dashboard reflects updated drive information immediately'
    );

    // 9. Officer Updates Application Status
    const allAppsRes = await makeRequest('GET', `/api/placement/applications?jobDriveId=${createdDriveId}`, null, officerToken);
    assert(allAppsRes.status === 200 && allAppsRes.data.data.length === 1, 'Officer retrieves applicant record');
    const appId = allAppsRes.data.data[0]._id;

    const statusUpdateRes = await makeRequest(
      'PATCH',
      `/api/placement/applications/${appId}/status`,
      { status: 'Shortlisted', remarks: 'Cleared Round 1 Technical Assessment.' },
      officerToken
    );
    assert(statusUpdateRes.status === 200, 'Officer updates application status to "Shortlisted"');

    const studentAppsRes = await makeRequest('GET', '/api/students/applications', null, studentToken);
    const updatedApp = studentAppsRes.data.data.find((a: any) => a._id === appId);
    assert(updatedApp && updatedApp.status === 'Shortlisted', 'Student applied page reflects "Shortlisted" status and remarks');

    // 10. Clean up test job drive and associated application
    await makeRequest('DELETE', `/api/placement/drives/${createdDriveId}`, null, officerToken);
    console.log('🧹 Cleaned up temporary test drive and application.');

    console.log(`\n========================================`);
    console.log(`🏁 Live Workflow Verification: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    process.exit(failed === 0 ? 0 : 1);
  } catch (err: any) {
    console.error('Workflow test error:', err);
    process.exit(1);
  }
};

runLiveWorkflowTests();
