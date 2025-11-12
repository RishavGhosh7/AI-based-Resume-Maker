import { Router } from 'express';
import { Request, Response } from 'express';
import { getHealth } from '../controllers/healthController';
import { asyncHandler } from '../middleware/errorHandler';
import { openApiSpec } from '../docs/openapi';

const router = Router();

router.get('/', asyncHandler(getHealth));

router.get('/openapi', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

export default router;