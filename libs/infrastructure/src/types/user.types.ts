export interface GetOrCreateUserAndTgAccountRequest {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  language?: string;
  isAllowsWrite?: boolean;
}

export interface GetOrCreateUserAndTgAccountResponse {
  accountId: number;
  uuid: string;
  displayName: string;
  language: string;
  avatarUrl?: string;
}

export interface UpdateUserRefreshTokenRequest {
  accountId: number;
  rt: string;
  rtExp: Date;
}
