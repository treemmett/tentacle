import 'reflect-metadata';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { Config } from './config';
import type { ApiMiddleware } from './nc';

export const AppDataSource = new DataSource({
  database: Config.DB_DATABASE,
  entities: [],
  host: Config.DB_HOST,
  migrations: [resolve(__dirname, './migrations/**')],
  password: Config.DB_PASSWORD,
  port: Config.DB_PORT,
  ssl: !!Config.DB_CERTIFICATE && {
    ca: Config.DB_CERTIFICATE,
  },
  subscribers: [],
  synchronize: !Config.DB_CERTIFICATE,
  type: 'postgres',
  username: Config.DB_USERNAME,
});

AppDataSource.initialize();

export const connectToDatabase: ApiMiddleware = async (req, res, next) => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  next();
};
