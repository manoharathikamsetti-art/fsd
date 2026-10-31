import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentLoginPage } from './pages/student/StudentLoginPage';
import { StudentDashboardPage } from './pages/student/StudentDashboardPage';
import { SkillsPage } from './pages/student/SkillsPage';
import { RecommendationsPage } from './pages/student/RecommendationsPage';
import { JobDetailPage } from './pages/student/JobDetailPage';
import { AppliedCompaniesPage } from './pages/student/AppliedCompaniesPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';

import { OfficerLoginPage } from './pages/officer/OfficerLoginPage';
import { OfficerDashboardPage } from './pages/officer/OfficerDashboardPage';
import { ManageDrivesPage } from './pages/officer/ManageDrivesPage';
import { ManageApplicationsPage } from './pages/officer/ManageApplicationsPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1, paddingBottom: '32px' }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<StudentLoginPage />} />
              <Route path="/officer/login" element={<OfficerLoginPage />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/skills"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <SkillsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/recommendations"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <RecommendationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/jobs/:id"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <JobDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/applied"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <AppliedCompaniesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <StudentProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Placement Officer Routes */}
              <Route
                path="/officer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['placement_officer']}>
                    <OfficerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/drives"
                element={
                  <ProtectedRoute allowedRoles={['placement_officer']}>
                    <ManageDrivesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/officer/applications"
                element={
                  <ProtectedRoute allowedRoles={['placement_officer']}>
                    <ManageApplicationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
