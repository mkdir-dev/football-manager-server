export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  allows_write_to_pm?: boolean;
  photo_url?: string;
  is_bot?: boolean;
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

export interface GetTokenRequest {
  id: number;
  uuid: string;
  displayName: string;
}

export interface JwtPayload {
  sub: string;
  id: number;
  uuid: string;
  displayName: string;
  // role: roleEnum;
}
