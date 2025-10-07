import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';
import { findUser } from '../services/users';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  next();
};

const checkEmailExistence = async (req: Request, res: Response, next: NextFunction) => {
  const email = req.body.email;
  const existingUser = await findUser({ where: { email } });

  if (existingUser) {
    return res.status(409).json({
      message: 'Email already exists',
      field: 'email',
    });
  }

  next();
};

const registrationRules = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
];

export const validateRegistration = [
  ...registrationRules,
  handleValidationErrors,
  checkEmailExistence,
];
