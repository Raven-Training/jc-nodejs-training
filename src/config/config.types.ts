export type ENV_VAR = string | undefined;

export type Dialect = 'postgres' | 'mysql' | 'sqlite' | 'mssql' | 'oracle';

export interface DatabaseConfig {
  type: Dialect;
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface ApiConfig {
  port: number;
}

export interface TodosApiConfig {
  baseURL: ENV_VAR;
}

export interface Config {
  nodeEnv: string;
  api: ApiConfig;
  common: {
    db: DatabaseConfig;
  };
  todosApi: TodosApiConfig;
}
