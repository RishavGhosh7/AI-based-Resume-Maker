import { Router } from 'express';
import {
  getResumes,
  createResume,
  getResumeById,
  updateResume,
  deleteResume,
} from '../controllers/resumeController';
import { asyncHandler } from '../middleware/errorHandler';
import Joi from 'joi';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';

const router = Router();

const resumeIdSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const contentSchema = Joi.object().keys({
  summary: Joi.string().optional(),
  sections: Joi.object().optional(),
}).unknown(true);

const createResumeSchema = Joi.object({
  title: Joi.string().required().min(1).max(100),
  content: contentSchema.required(),
  skills: Joi.array().items(Joi.string().min(1)).required().min(1),
  experience: Joi.string().required().min(1),
  jobDescription: Joi.string().required().min(1),
  templateType: Joi.string().required().min(1),
});

const updateResumeSchema = Joi.object({
  title: Joi.string().optional().min(1).max(100),
  content: contentSchema.optional(),
  template: Joi.string().optional().min(1),
}).min(1);

const listQuerySchema = Joi.object({
  page: Joi.number().optional().min(1).default(1),
  limit: Joi.number().optional().min(1).max(100).default(10),
});

router.get('/', validateQuery(listQuerySchema), asyncHandler(getResumes));
router.post('/', validateBody(createResumeSchema), asyncHandler(createResume));
router.get('/:id', validateParams(resumeIdSchema), asyncHandler(getResumeById));
router.put(
  '/:id',
  validateParams(resumeIdSchema),
  validateBody(updateResumeSchema),
  asyncHandler(updateResume)
);
router.delete('/:id', validateParams(resumeIdSchema), asyncHandler(deleteResume));

export default router;