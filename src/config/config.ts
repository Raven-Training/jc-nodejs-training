import dotenv from 'dotenv';

import { Config } from './config.types';

dotenv.config();

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  api: {
    port: Number(process.env.PORT) || 3000,
  },
  common: {
    db: {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USERNAME || 'username',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'mydb',
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  todosApi: {
    baseURL: process.env.TODOS_API_BASE_URL || 'https://jsonplaceholder.typicode.com',
  },
  pokeApi: {
    baseURL: process.env.POKEAPI_BASE_URL || 'https://pokeapi.co/api/v2/',
  },
};

export default config;
