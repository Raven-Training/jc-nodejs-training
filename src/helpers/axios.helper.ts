import axios, { AxiosRequestConfig } from 'axios';

export const createAxiosInstance = (
  baseURL: string | undefined,
  options: Record<string, AxiosRequestConfig> = {},
) => {
  if (!baseURL) {
    throw new Error('Base URL is required to create an Axios instance.');
  }
  return axios.create({
    baseURL,
    responseType: 'json',
    ...options,
  });
};
