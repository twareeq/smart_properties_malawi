import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(res, 400, false, 'User already exists with this email');
    }

    const hashedPassword = await hashPassword(password);

    // Create user and profile within a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role,
          profile: {
            create: {
              firstName,
              lastName,
            }
          }
        },
        include: {
          profile: true
        }
      });
      return user;
    });

    const token = generateToken(newUser.id, newUser.role);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    return sendSuccess(res, 201, true, 'User registered successfully', {
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    return sendError(res, 500, false, 'Error registering user', error.message);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    });

    if (!user || !user.passwordHash) {
      return sendError(res, 401, false, 'Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 401, false, 'Invalid credentials');
    }

    const token = generateToken(user.id, user.role);

    const { passwordHash: _, ...userWithoutPassword } = user;

    return sendSuccess(res, 200, true, 'Logged in successfully', {
      user: userWithoutPassword,
      token
    });
  } catch (error: any) {
    return sendError(res, 500, false, 'Error logging in', error.message);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true
      }
    });

    if (!user) {
      return sendError(res, 404, false, 'User not found');
    }

    return sendSuccess(res, 200, true, 'User profile fetched successfully', user);
  } catch (error: any) {
    return sendError(res, 500, false, 'Error fetching profile', error.message);
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { firstName, lastName, phone, bio, avatarUrl } = req.body;

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(bio && { bio }),
        ...(avatarUrl && { avatarUrl }),
      }
    });

    return sendSuccess(res, 200, true, 'Profile updated successfully', updatedProfile);
  } catch (error: any) {
    return sendError(res, 500, false, 'Error updating profile', error.message);
  }
};
