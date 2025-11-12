import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'sessionId';
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

declare global {
  namespace Express {
    interface Request {
      sessionId?: string;
    }
  }
}

export const sessionHandler = (req: Request, res: Response, next: NextFunction): void => {
  // Try to get sessionId from cookie
  let sessionId = req.cookies?.[SESSION_COOKIE_NAME];

  // If no sessionId in cookie, check Authorization header
  if (!sessionId) {
    const authHeader = req.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionId = authHeader.substring(7);
    }
  }

  // If still no sessionId, generate a new one
  if (!sessionId) {
    sessionId = uuidv4();
  }

  // Attach sessionId to request
  req.sessionId = sessionId;

  // Set sessionId as cookie if not already set
  if (!req.cookies?.[SESSION_COOKIE_NAME]) {
    res.cookie(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
  }

  next();
};
