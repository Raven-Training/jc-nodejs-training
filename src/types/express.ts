import { JwtPayload } from './auth.types';
import { UserRole } from './user.types';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        currentRole?: UserRole;
      };
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export {};
