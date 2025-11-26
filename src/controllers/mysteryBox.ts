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

    console.info(`Controller - Processing mystery box purchase for user ${userId}`);

    const result = await purchaseMysteryBoxService(userId);

    console.info(
      `Controller - Mystery box purchase successful: ${result.data.pokemonName} (${result.data.rarity}) for user ${userId}`,
    );

    return res.status(status.CREATED).json(result);
  } catch (err) {
    console.error('Controller Error - Failed to process mystery box purchase:', err);
    next(err);
  }
}
