import { Request, Response, NextFunction } from 'express';
import { validationResult, body, ValidationChain } from 'express-validator';

import { findUser } from '../services/users';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  next();
};

export const validate = (
  rules: ValidationChain[],
  customValidators: Array<
    (req: Request, res: Response, next: NextFunction) => void | Promise<void>
  > = [],
) => [...rules, handleValidationErrors, ...customValidators];

const checkEmailExistence = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const email = req.body.email;
  const existingUser = await findUser({ where: { email } });

  if (existingUser) {
    res.status(409).json({
      message: 'Email already exists',
      field: 'email',
    });
    return;
  }

  next();
};

const userValidationRules = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

export const validateRegistration = validate(userValidationRules, [checkEmailExistence]);

export const validateAdminUserCreation = validate(userValidationRules, []);

export const validateLogin = validate([
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
]);
