const {
  PORT,
  API_GLOBAL_PREFIX,

  // telegram bot
  TELEGRAM_BOT_NAME,
  TELEGRAM_BOT_TOKEN,

  // jwt config
  AT_JWT_SECRET_KEY,
  RT_JWT_SECRET_KEY,
  AT_JWT_SECRET_KEY_TIMEOUT,
  RT_JWT_SECRET_KEY_TIMEOUT,

  // rabbitmq
  RABBITMQ_HOST,
  RABBITMQ_USER,
  RABBITMQ_PASS,
  RABBITMQ_PORT,
  RABBITMQ_PANEL_PORT,

  // redis
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASS,
} = process.env;

export interface Config {
  PORT: number;
  API_GLOBAL_PREFIX: string;

  // telegram bot
  TELEGRAM_BOT_NAME: string;
  TELEGRAM_BOT_TOKEN: string;

  // jwt config
  AT_JWT_SECRET_KEY: string;
  RT_JWT_SECRET_KEY: string;
  AT_JWT_SECRET_KEY_TIMEOUT: string;
  RT_JWT_SECRET_KEY_TIMEOUT: string;

  // rabbitmq
  RABBITMQ_HOST: string;
  RABBITMQ_USER: string;
  RABBITMQ_PASS: string;
  RABBITMQ_PORT: number;
  RABBITMQ_PANEL_PORT: number;

  // redis
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASS: string;
}

export default (): Config => ({
  PORT: parseInt(PORT) || 8000,
  API_GLOBAL_PREFIX: API_GLOBAL_PREFIX || 'api',

  // telegram bot
  TELEGRAM_BOT_NAME: TELEGRAM_BOT_NAME || 'test_bot',
  TELEGRAM_BOT_TOKEN: TELEGRAM_BOT_TOKEN || '8073369001:ABHaZ16b7A2V0dK4PcMbcaET-IBvc1o0q5A',

  // jwt config
  AT_JWT_SECRET_KEY: AT_JWT_SECRET_KEY || 'at-super-secre-tkey',
  RT_JWT_SECRET_KEY: RT_JWT_SECRET_KEY || 'rt-super-secre-tkey',
  AT_JWT_SECRET_KEY_TIMEOUT: AT_JWT_SECRET_KEY_TIMEOUT || '7d',
  RT_JWT_SECRET_KEY_TIMEOUT: RT_JWT_SECRET_KEY_TIMEOUT || '30d',

  // redis
  REDIS_HOST: REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(REDIS_PORT) || 6379,
  REDIS_PASS: REDIS_PASS || 'password',

  RABBITMQ_HOST: RABBITMQ_HOST || 'localhost',
  RABBITMQ_USER: RABBITMQ_USER || 'admin',
  RABBITMQ_PASS: RABBITMQ_PASS || 'admin',
  RABBITMQ_PORT: parseInt(RABBITMQ_PORT) || 5672,
  RABBITMQ_PANEL_PORT: parseInt(RABBITMQ_PANEL_PORT) || 15672,
});
