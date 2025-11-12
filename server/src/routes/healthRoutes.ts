import { Router } from 'express';
import { getHealth } from '../controllers/healthController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(getHealth));

export default router;