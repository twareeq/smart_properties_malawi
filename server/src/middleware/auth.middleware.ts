import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';
import { sendError } from '../utils/response';
import { prisma } from '../config/prisma';

interface JwtPayload {
  id: string;
  role: string;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    
    // Check headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 401, false, 'Not authorized to access this route');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Attach user to request
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      return sendError(res, 401, false, 'User belonging to this token no longer exists');
    }

    // Note: in a real Next.js/Express typed env, you extend Express.Request. 
    // Creating a quick inline TS override here for req.user
    (req as any).user = user;

    next();
  } catch (error) {
    return sendError(res, 401, false, 'Not authorized to access this route');
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return sendError(res, 403, false, `User role ${user?.role} is not authorized to access this route`);
    }
    next();
  };
};
