import axios, { AxiosError } from 'axios';
import httpStatus from 'http-status';

import config from '../config/config';
import { externalApiError, defaultError } from '../errors';

export const cardsAxiosInstance = axios.create({
  baseURL: process.env.API_URL,
});

export const todosAxiosInstance = axios.create({
  baseURL: config.todosApi.baseURL,
  responseType: 'json',
});

const extractErrorDetails = (
  error: AxiosError,
  endpoint: string,
): { status: number; message: string } => {
  const { status } = error.response!;
  let message = `Error querying API at '${endpoint}'.`;

  switch (status) {
    case httpStatus.NOT_FOUND:
      message = `The requested resource at '${endpoint}' was not found.`;
      break;
    case httpStatus.TOO_MANY_REQUESTS:
      message = `Too many requests to the API. Please try again later.`;
      break;
    default:
      if (status >= 500) {
        message = `The API is currently unavailable (status ${status}).`;
      }
      break;
  }

  return { status, message };
};

const logError = (message: string, status?: number): void => {
  if (status) {
    console.error(`${message} - Status: ${status}`);
  } else {
    console.error(message);
  }
};

const throwAppropriateError = (status: number): never => {
  if (status === httpStatus.NOT_FOUND || status === httpStatus.TOO_MANY_REQUESTS || status >= 500) {
    throw externalApiError;
  }
  throw defaultError;
};

export const handleApiError = (error: unknown, endpoint: string): never => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status, message } = extractErrorDetails(error, endpoint);
      logError(message, status);
      throwAppropriateError(status);
    } else if (error.request) {
      logError(`Network error when trying to reach the API at '${endpoint}'.`);
      throw externalApiError;
    }
  }

  logError(`An unexpected error occurred: ${error}`);
  throw defaultError;
};
