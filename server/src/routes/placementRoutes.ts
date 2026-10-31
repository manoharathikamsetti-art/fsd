import { Router } from 'express';
import {
  getDashboardStats,
  getAllJobDrives,
  createJobDrive,
  updateJobDrive,
  deleteJobDrive,
  getAllApplications,
  updateApplicationStatus,
  getAllCompanies,
  createCompany,
} from '../controllers/placementController';
import { authenticateToken, requireOfficer } from '../middleware/auth';

const router = Router();

// All placement routes require placement_officer role
router.use(authenticateToken, requireOfficer);

router.get('/dashboard-stats', getDashboardStats);

// Job drives
router.get('/drives', getAllJobDrives);
router.post('/drives', createJobDrive);
router.put('/drives/:id', updateJobDrive);
router.delete('/drives/:id', deleteJobDrive);

// Applications
router.get('/applications', getAllApplications);
router.patch('/applications/:id/status', updateApplicationStatus);

// Companies
router.get('/companies', getAllCompanies);
router.post('/companies', createCompany);

export default router;
