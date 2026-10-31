import { Router } from 'express';
import { getActiveJobDrives, getJobDriveById } from '../controllers/jobController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Routes available to authenticated users (both student & officer)
router.use(authenticateToken);

router.get('/', getActiveJobDrives);
router.get('/:id', getJobDriveById);

export default router;
