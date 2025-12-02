import { NextFunction, Request, Response } from 'express';
import status from 'http-status';

import { purchaseMysteryBox as purchaseMysteryBoxService } from '../services/mysteryBox';

export async function purchaseMysteryBox(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    const userId = req.user!.userId;
    const limit = parseInt(req.query.limit as string) || undefined;

    console.info(
      `Controller - Processing mystery box purchase for user ${userId}${limit ? ` with limit ${limit}` : ''}`,
    );

    const result = await purchaseMysteryBoxService(userId, limit);

    console.info(`Controller - Mystery box purchase successful for user ${userId}`);

    return res.status(status.CREATED).json(result);
  } catch (err) {
    console.error('Controller Error - Failed to process mystery box purchase:', err);
    next(err);
  }
}
