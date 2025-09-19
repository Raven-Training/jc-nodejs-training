import 'reflect-metadata';
import { DataSource } from 'typeorm';

import config from './config/config';

export const AppDataSource = new DataSource({
  type: config.common.db.type,
  host: config.common.db.host,
  port: config.common.db.port,
  username: config.common.db.user,
  password: config.common.db.password,
  database: config.common.db.database,
  synchronize: true, // ⚠️ Only in development, not in production - CHANGE later!!!!
  logging: true,
  entities: [__dirname + '/entities/*.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});
