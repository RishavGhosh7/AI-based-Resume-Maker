import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';

export const validateBody = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // const details = error.details.map(detail => ({
      //   field: detail.path.join('.'),
      //   message: detail.message,
      // }));

      throw new AppError(
        'Validation failed',
        400,
        'VALIDATION_ERROR'
      );
    }

    req.body = value;
    next();
  };
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // const details = error.details.map(detail => ({
      //   field: detail.path.join('.'),
      //   message: detail.message,
      // }));

      throw new AppError(
        'Query validation failed',
        400,
        'QUERY_VALIDATION_ERROR'
      );
    }

    req.query = value;
    next();
  };
};

export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      // const details = error.details.map(detail => ({
      //   field: detail.path.join('.'),
      //   message: detail.message,
      // }));

      throw new AppError(
        'Parameter validation failed',
        400,
        'PARAM_VALIDATION_ERROR'
      );
    }

    req.params = value;
    next();
  };
};