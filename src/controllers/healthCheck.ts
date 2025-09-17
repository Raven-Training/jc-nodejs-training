import { Request, Response } from 'express';

export function healthCheck(_: Request, res: Response): Response {
  return res.status(200).send({ uptime: process.uptime() });
}
