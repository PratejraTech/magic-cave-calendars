import { Request, Response, NextFunction } from 'express';
import { supabaseAuth } from '../../lib/supabaseClient';

// Extend Express Request interface to include user
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        // Add other user properties as needed
      };
    }
  }
}

/**
 * Authentication middleware for Supabase JWT tokens
 * Extracts and validates the JWT token from Authorization header
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header missing or malformed',
        message: 'Please provide a valid Bearer token'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: 'Please log in again'
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email || '',
    };

    next();
   } catch {
    // TODO: Implement proper error logging service
    return res.status(500).json({
      error: 'Authentication service error',
      message: 'Please try again later'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if token is present, but doesn't fail if missing
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

      if (!error && user) {
        req.user = {
          id: user.id,
          email: user.email || '',
        };
      }
    }

    next();
   } catch {
    // For optional auth, we don't fail on errors - just continue without user
    // TODO: Implement proper warning logging service
    next();
  }
};