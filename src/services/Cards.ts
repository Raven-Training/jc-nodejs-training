import axios, { AxiosInstance, AxiosError } from 'axios';
import { GameInfo, CardsResponse } from '../types/hearthstone.types';
import { ApiError } from '../errors';
import httpStatus from 'http-status';

const API_KEY = process.env.RAPIDAPI_KEY;
const API_HOST = 'omgvamp-hearthstone-v1.p.rapidapi.com';
const API_URL = `https://${API_HOST}/`;

class HearthstoneApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    if (!API_KEY) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'The Hearthstone API key is not set in the environment variables.',
      );
    }

    this.axiosInstance = axios.create({
      baseURL: API_URL,
      headers: {
        'x-rapidapi-host': API_HOST,
        'x-rapidapi-key': API_KEY,
      },
    });
  }

  private async handleRequest<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint);
      console.log(`Hearthstone API - Data '${endpoint}' obtained successfully.`);
      return response.data;
    } catch (error) {
      this.handleApiError(error, endpoint);
    }
  }

  private handleApiError(error: unknown, endpoint: string): never {
    let errorMessage = `Error querying endpoint '${endpoint}' in the Hearthstone API.`;

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        errorMessage += ` The server responded with status: ${axiosError.response.status}.`;
      } else if (axiosError.request) {
        errorMessage += ' No response was received from the server.';
      } else {
        errorMessage += ` Details: ${axiosError.message}`;
      }
    }

    console.error(errorMessage);
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      `Could not obtain Hearthstone data from '${endpoint}'.`,
    );
  }

  public async getInfo(): Promise<GameInfo> {
    return this.handleRequest<GameInfo>('/info');
  }

  public async getCards(): Promise<CardsResponse> {
    return this.handleRequest<CardsResponse>('/cards');
  }
}

export const hearthstoneApiService = new HearthstoneApiService();
