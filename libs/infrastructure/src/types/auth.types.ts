export class LoginTmaAuthResponse {
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
