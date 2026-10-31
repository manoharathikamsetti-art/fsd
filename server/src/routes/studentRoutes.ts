import { Router } from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  getStudentSkills,
  updateStudentSkills,
  getRecommendations,
  getStudentApplications,
  applyToJobDrive,
  confirmExternalApplication,
} from '../controllers/studentController';
import { authenticateToken, requireStudent } from '../middleware/auth';

const router = Router();

// All routes require student authentication
router.use(authenticateToken, requireStudent);

router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.get('/skills', getStudentSkills);
router.put('/skills', updateStudentSkills);
router.get('/recommendations', getRecommendations);
router.get('/applications', getStudentApplications);
router.post('/apply/:jobDriveId', applyToJobDrive);
router.patch('/applications/:applicationId/confirm-external', confirmExternalApplication);

export default router;
