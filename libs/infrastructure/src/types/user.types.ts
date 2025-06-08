export interface GetOrCreateUserAndTgAccountRequest {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  language?: string;
  isAllowsWrite?: boolean;
}

export interface GetOrCreateUserResponse {
  accountId: number;
  uuid: string;
  displayName: string;
  language: string;
  avatarUrl?: string;
}

export interface UpdateUserRefreshTokenRequest {
  accountId: number;
  rt?: string;
  rtExp?: Date;
}

export interface GetOrCreateUserByGoogleOAuthRequest {
  googleId: string; // sub: string; - subject (user id)
  firstName: string; // given_name?: string;
  lastName?: string; // family_name?: string;
  username?: string; // name?: string;
  email?: string; // email?: string;
  isVerifiedEmail?: boolean; // email_verified?: boolean;
  avatarUrl?: string; // picture?: string;
}

export interface TelegramAccount {
  telegramAccountId: number;
  telegramId: number;
  username: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  language?: string;
  isAllowsWrite: boolean;
}

export interface GoogleAccount {
  googleAccountId: number;
  googleId: string;
  username: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  email?: string;
  isVerifiedEmail: boolean;
}

export interface UserAccount {
  accountId: number;
  uuid: string;
  displayName: string;
  language: string;
  avatarUrl?: string;
  email?: string;
  telegramAccount: TelegramAccount;
  googleAccount: GoogleAccount;
}

export interface UserAccountAuthData {
  accountId: number;
  uuid: string;
  displayName: string;
  language: string;
  avatarUrl?: string;
  hashRefreshToken: string;
  refreshTokenExpiry: Date;
}
