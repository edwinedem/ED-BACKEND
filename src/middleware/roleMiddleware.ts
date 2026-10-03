import type { Request, Response, NextFunction } from 'express';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // 1. Ensure user exists on req (set by authenticateToken middleware)
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Please log in first.' });
    }

    // 2. Check if the user's userRole is included in allowedRoles
    // (Note: adjust req.user.userRole or req.user.role to match what you saved in your JWT payload)
    const userRole = req.user.userRole || req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Forbidden. You do not have permission to perform this action.' 
      });
    }

    // 3. Role is valid! Proceed to the controller
    next();
  };
};