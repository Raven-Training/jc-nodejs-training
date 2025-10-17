import { Request, Response, NextFunction } from 'express';

import { authenticationError, invalidTokenError } from '../errors';
import { verifyToken, JwtPayload } from '../helpers/jwt.helper';

// Extender el tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next(authenticationError('Access token required'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    console.log(`User ${decoded.userId} authenticated successfully`); 
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    next(invalidTokenError('Invalid or expired token'));
  }
};