import { Router } from 'express';
import { 
  getResumes, 
  createResume, 
  getResumeById, 
  updateResume, 
  deleteResume 
} from '../controllers/resumeController';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';
import { validateBody, validateParams } from '../middleware/validation';

const router = Router();

// Validation schemas
const resumeIdSchema = Joi.object({
  id: Joi.string().required(),
});

const createResumeSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  content: Joi.object().optional(),
});

const updateResumeSchema = Joi.object({
  title: Joi.string().optional().min(1).max(100),
  content: Joi.object().optional(),
});

// Routes
router.get('/', asyncHandler(getResumes));
router.post('/', validateBody(createResumeSchema), asyncHandler(createResume));
router.get('/:id', validateParams(resumeIdSchema), asyncHandler(getResumeById));
router.put('/:id', validateParams(resumeIdSchema), validateBody(updateResumeSchema), asyncHandler(updateResume));
router.delete('/:id', validateParams(resumeIdSchema), asyncHandler(deleteResume));

export default router;