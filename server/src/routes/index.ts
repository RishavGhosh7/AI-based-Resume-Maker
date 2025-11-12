import { Router } from 'express';
import healthRoutes from './healthRoutes';
import resumeRoutes from './resumeRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/resumes', resumeRoutes);

export default router;