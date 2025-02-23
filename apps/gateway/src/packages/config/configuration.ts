const {
  PORT,
  API_GLOBAL_PREFIX,

  RABBITMQ_HOST,
  RABBITMQ_USER,
  RABBITMQ_PASS,
  RABBITMQ_PORT,
  RABBITMQ_PANEL_PORT,
} = process.env;

export interface Config {
  PORT: number;
  API_GLOBAL_PREFIX: string;

  RABBITMQ_HOST: string;
  RABBITMQ_USER: string;
  RABBITMQ_PASS: string;
  RABBITMQ_PORT: number;
  RABBITMQ_PANEL_PORT: number;
}

export default (): Config => ({
  PORT: parseInt(PORT) || 8000,
  API_GLOBAL_PREFIX: API_GLOBAL_PREFIX || 'api',

  RABBITMQ_HOST: RABBITMQ_HOST || 'localhost',
  RABBITMQ_USER: RABBITMQ_USER || 'admin',
  RABBITMQ_PASS: RABBITMQ_PASS || 'admin',
  RABBITMQ_PORT: parseInt(RABBITMQ_PORT) || 5672,
  RABBITMQ_PANEL_PORT: parseInt(RABBITMQ_PANEL_PORT) || 15672,
});
