import axios, { AxiosError } from 'axios';
import httpStatus from 'http-status';

import logger from '../config/logger';
import { ApiError } from '../errors';
import { PokemonList } from '../types/cards.types';

const API_URL = 'https://pokeapi.co/api/v2/';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

const handleApiError = (error: unknown, endpoint: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const { status } = axiosError.response;
      let message = `Error querying PokeAPI at '${endpoint}'.`;
      let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;

      switch (status) {
        case httpStatus.NOT_FOUND:
          statusCode = httpStatus.NOT_FOUND;
          message = `The requested resource at '${endpoint}' was not found.`;
          break;
        case httpStatus.TOO_MANY_REQUESTS:
          statusCode = httpStatus.TOO_MANY_REQUESTS;
          message = `Too many requests to PokeAPI. Please try again later.`;
          break;
        default:
          if (status >= 500) {
            statusCode = httpStatus.SERVICE_UNAVAILABLE;
            message = `PokeAPI is currently unavailable (status ${status}).`;
          }
          break;
      }
      logger.error(`${message} - Status: ${status}`);
      throw new ApiError(statusCode, message);
    } else if (axiosError.request) {
      logger.error(`Network error when trying to reach PokeAPI at '${endpoint}'.`);
      throw new ApiError(
        httpStatus.SERVICE_UNAVAILABLE,
        `Could not connect to PokeAPI. Please check your network connection.`,
      );
    }
  }

  logger.error(`An unexpected error occurred: ${error}`);
  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'An unexpected error occurred.');
};

const handleRequest = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await axiosInstance.get<T>(endpoint);
    logger.info(`PokeAPI - Data for '${endpoint}' obtained successfully.`);
    return response.data;
  } catch (error) {
    return handleApiError(error, endpoint);
  }
};

export const getPokemons = async (): Promise<PokemonList> => {
  return handleRequest<PokemonList>('pokemon');
};
