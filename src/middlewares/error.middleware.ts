import { inspect } from 'node:util';

import { NextFunction, Response, Request } from 'express';
import status from 'http-status';

const DEFAULT_STATUS_CODE = status.INTERNAL_SERVER_ERROR;

export interface InternalError {
  internalCode: string;
  message: string;
  statusCode: number;
}

export const createInternalError =
  (internalCode: string, statusCode: number) =>
  (message: string, err?: Error): InternalError => {
    if (err) {
      console.error(inspect(err));
    }
    return { message, internalCode, statusCode };
  };
export function errorHandlerMiddleware(
  error: InternalError,
  _: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  if (error.internalCode) {
    res.status(error.statusCode || DEFAULT_STATUS_CODE);
  } else {
    // Unrecognized error! notifying it to error tracking tool.
    console.error(inspect(error));
    res.status(DEFAULT_STATUS_CODE);
    return next(error);
  }
  return res.send({ message: error.message, internal_code: error.internalCode });
}
