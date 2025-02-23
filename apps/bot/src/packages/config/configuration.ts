const { PORT, WEB_APP_URL, TELEGRAM_BOT_TOKEN } = process.env;

export interface Config {
  PORT: number;
  WEB_APP_URL: string;
  TELEGRAM_BOT_TOKEN: string;
}

export default (): Config => ({
  PORT: parseInt(PORT) || 4000,
  WEB_APP_URL,
  TELEGRAM_BOT_TOKEN,
});
