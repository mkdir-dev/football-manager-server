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

export interface GoogleIdTokenPayload {
  iss: string; // issuer
  azp?: string; // authorized party
  aud: string; // audience (client id)
  sub: string; // subject (user id)
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  iat: number; // issued at (timestamp)
  exp: number; // expiration (timestamp)
  nbf?: number; // not before (timestamp)
  jti?: string; // JWT ID
}
