export class LoginResponse {
  accountId: number;
  uuid: string;
  displayName: string;
  language: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: Date;
  refreshTokenExpiry: Date;
}

export class LoginTmaOAuthRequest {
  id: number;
  first_name: string;
  auth_date: number;
  last_name?: string;
  photo_url?: string;
  username?: string;
}
