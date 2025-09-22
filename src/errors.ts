import status from 'http-status';

import { createInternalError } from './middlewares/error.middleware';

export const AUTHENTICATION_ERROR = 'authentication_error';
export const authenticationError = createInternalError(AUTHENTICATION_ERROR, status.UNAUTHORIZED);

export const DATABASE_ERROR = 'database_error';
export const databaseError = createInternalError(DATABASE_ERROR, status.SERVICE_UNAVAILABLE);

export const DEFAULT_ERROR = 'default_error';
export const defaultError = createInternalError(DEFAULT_ERROR, status.INTERNAL_SERVER_ERROR);

export const NOT_FOUND_ERROR = 'not_found_error';
export const notFoundError = createInternalError(NOT_FOUND_ERROR, status.NOT_FOUND);

export const ALREADY_EXIST_ERROR = 'already_exist_error';
export const alreadyExistError = createInternalError(ALREADY_EXIST_ERROR, status.CONFLICT);

export const EXTERNAL_API_ERROR = 'external_api_error';
export const externalApiError = createInternalError(EXTERNAL_API_ERROR, status.NOT_FOUND);
