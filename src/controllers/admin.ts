import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import * as userService from '../services/users';
import { CreateAdminUserRequest } from '../types/user.types';

export async function createAdminUser(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const adminUserData: CreateAdminUserRequest = req.body;
    const adminUser = await userService.createAdminUser(adminUserData);

    console.log(
      `Admin user ${adminUser.email} created/updated successfully by admin ${req.user!.userId}`,
    );

    return res.status(status.CREATED).json({
      user: adminUser,
      message: 'Admin user created successfully',
    });
  } catch (err) {
    console.error(`Database error while creating admin user by admin ${req.user!.userId}:`, err);
    next(err);
  }
}
