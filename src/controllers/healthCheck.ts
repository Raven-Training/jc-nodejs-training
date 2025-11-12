import { Request, Response } from 'express';
import status from 'http-status';

export function healthCheck(_: Request, res: Response): Response {
  return res.status(status.OK).json({ uptime: process.uptime() });
}
