import { Router, Request, Response, NextFunction } from 'express';
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

const experienceHistorySchema = Joi.object({
  company: Joi.string().required(),
  position: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  description: Joi.string().optional(),
  achievements: Joi.array().items(Joi.string()).optional(),
});

const generatedSectionsSchema = Joi.object({
  summary: Joi.string().optional(),
  skills: Joi.string().optional(),
  experience: Joi.string().optional(),
  education: Joi.string().optional(),
});

const createResumeSchema = Joi.object({
  userId: Joi.string().optional(),
  sessionId: Joi.string().optional(),
  templateType: Joi.string().valid('fresher', 'mid', 'senior').default('fresher'),
  skills: Joi.array().items(Joi.string()).required().min(1),
  experienceHistory: Joi.array().items(experienceHistorySchema).optional(),
  jobDescription: Joi.string().optional(),
  generatedSections: generatedSectionsSchema.optional(),
});

const updateResumeSchema = Joi.object({
  templateType: Joi.string().valid('fresher', 'mid', 'senior').optional(),
  skills: Joi.array().items(Joi.string()).optional().min(1),
  experienceHistory: Joi.array().items(experienceHistorySchema).optional(),
  jobDescription: Joi.string().optional(),
  generatedSections: generatedSectionsSchema.optional(),
  isEditable: Joi.boolean().optional(),
});

const querySchema = Joi.object({
  userId: Joi.string().optional(),
  sessionId: Joi.string().optional(),
  templateType: Joi.string().valid('fresher', 'mid', 'senior').optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('createdAt', 'updatedAt', 'templateType').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Routes
router.get('/', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = querySchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0]?.message || 'Validation failed'
      }
    });
  }
  req.query = value;
  return next();
}), asyncHandler(getResumes));

router.post('/', validateBody(createResumeSchema), asyncHandler(createResume));
router.get('/:id', validateParams(resumeIdSchema), asyncHandler(getResumeById));
router.put('/:id', validateParams(resumeIdSchema), validateBody(updateResumeSchema), asyncHandler(updateResume));
router.delete('/:id', validateParams(resumeIdSchema), asyncHandler(deleteResume));

export default router;