export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: true;
}

export interface TelegramInitialData {
  token: string;
  hash: string;
  metadata: {
    user: TelegramUser;
    authDate: string;
    queryId: string;
  };
}
