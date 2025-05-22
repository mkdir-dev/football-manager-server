import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as jwt_decode from 'jwt-decode';

import { AuthenticationExceptions } from '@infrastructure/exceptions/auth.exceptions';
import { ServerExceptions } from '@infrastructure/exceptions/server.exceptions';
import { LoginResponse, LoginTmaOAuthRequest } from '@infrastructure/types/auth.types';

import { UserService } from 'user/user.service';

import {
  GetTokenRequest,
  GoogleIdTokenPayload,
  JwtPayload,
  JwtTokenType,
  TelegramInitialData,
} from 'authentication/authentication.types';
import { TelegramWebAppToken } from 'authentication/authentication.constants';
import {
  GetOrCreateUserAndTgAccountRequest,
  GetOrCreateUserResponse,
} from '@infrastructure/types/user.types';

@Injectable()
export class AuthenticationService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async loginTmaAuth(initialDataRaw: string): Promise<LoginResponse> {
    try {
      if (!initialDataRaw || typeof initialDataRaw !== 'string') {
        throw new UnauthorizedException(
          AuthenticationExceptions.AuthorizationHeaderIsMissingOrInvalid
        );
      }

      const initialData = await this.authenticateByTmaInitialData(initialDataRaw);

      return await this.loginByTelegramData({
        telegramId: initialData.metadata.user.id,
        firstName: initialData.metadata.user.first_name,
        lastName: initialData.metadata.user.last_name,
        username: initialData.metadata.user.username,
        avatarUrl: initialData.metadata.user.photo_url,
        isAllowsWrite: initialData.metadata.user.allows_write_to_pm,
        language: initialData.metadata.user.language_code,
      });
    } catch (error) {
      console.error('Error: ', error);
      throw new UnauthorizedException(AuthenticationExceptions.Unauthorized);
    }
  }

  async loginTmaOAuth(hash: string, data: LoginTmaOAuthRequest) {
    try {
      const authData = await this.authenticateByTmaData(hash, data);

      return await this.loginByTelegramData({
        telegramId: authData.telegramId,
        firstName: authData.firstName,
        lastName: authData.lastName,
        username: authData.username,
        avatarUrl: authData.avatarUrl,
      });
    } catch (error) {
      console.error('Error: ', error);
      throw new UnauthorizedException(AuthenticationExceptions.Unauthorized);
    }
  }

  async loginGoogleOAuth(credential: string) {
    try {
      const authData = jwt_decode.jwtDecode(credential) as GoogleIdTokenPayload;

      const user = await this.userService.getOrCreateUserByGoogleOAuth({
        googleId: authData.sub, // sub: string; - subject (user id)
        firstName: authData.given_name, // given_name?: string;
        lastName: authData.family_name, // family_name?: string;
        username: authData.name, // name?: string;
        email: authData.email, // email?: string;
        isVerifiedEmail: authData.email_verified, // email_verified?: boolean;
        avatarUrl: authData.picture, // picture?: string;
      });

      return await this.getTokensAndUpdateRefreshToken(user);
    } catch (error) {
      console.error('Error: ', error);
      throw new UnauthorizedException(AuthenticationExceptions.Unauthorized);
    }
  }

  async refreshToken(refreshToken: string, payload: JwtPayload) {
    try {
      if (payload.type !== 'refresh') {
        console.error('Error: not a refresh token. ', payload);
        throw new UnauthorizedException(AuthenticationExceptions.InvalidHash);
      }

      const userAuthData = await this.userService.getUserAuthDataByAccountId(payload.id);
      if (!userAuthData) {
        console.error('Error: user not found. ', userAuthData);
        throw new UnauthorizedException(AuthenticationExceptions.UserNotFound);
      }

      // сравнение хеша refresh токена, если хранишь его в базе
      const isValidRefreshToken = await bcrypt
        .compare(refreshToken.replace('Bearer', '').trim(), userAuthData.hashRefreshToken)
        .then((result: boolean) => result)
        .catch((error: any): Error => {
          console.error('Error: ', error);
          throw new InternalServerErrorException(ServerExceptions.InternalServerError);
        });

      const refreshTokenExpiry = new Date(userAuthData.refreshTokenExpiry).getTime();
      const dateNow = new Date().getTime();
      if (refreshTokenExpiry < dateNow || payload.exp * 1000 < dateNow) {
        console.error('Error: refresh token expired');
        throw new UnauthorizedException(AuthenticationExceptions.TokenExpired);
      }

      if (!isValidRefreshToken) {
        console.error('Error: refresh token is invalid');
        throw new UnauthorizedException(AuthenticationExceptions.InvalidHash);
      }

      const tokens = await this.getTokens({
        id: userAuthData.accountId,
        uuid: userAuthData.uuid,
        displayName: userAuthData.displayName,
      });

      const isUpdateRefreshToken = await this.updateRefreshToken(
        userAuthData.accountId,
        tokens.refreshToken
      );
      if (!isUpdateRefreshToken.success) {
        console.error('Error: update refresh token failed');
        throw new UnauthorizedException(AuthenticationExceptions.TokenRefreshError);
      }

      return {
        accountId: userAuthData.accountId,
        uuid: userAuthData.uuid,
        displayName: userAuthData.displayName,
        language: userAuthData.language,
        avatarUrl: userAuthData.avatarUrl,
        ...tokens,
        accessTokenExpiry: new Date(tokens.accessTokenExpiry),
        refreshTokenExpiry: new Date(tokens.refreshTokenExpiry),
      };
    } catch (error) {
      console.error('Error: ', error);
      throw new UnauthorizedException(AuthenticationExceptions.Unauthorized);
    }
  }

  private async loginByTelegramData(data: GetOrCreateUserAndTgAccountRequest) {
    const user = await this.userService.getOrCreateUserByTgInitData(data);

    return await this.getTokensAndUpdateRefreshToken(user);
  }

  private async getTokensAndUpdateRefreshToken(user: GetOrCreateUserResponse) {
    const tokens = await this.getTokens({
      id: user.accountId,
      uuid: user.uuid,
      displayName: user.displayName,
    });

    const isUpdateRefreshToken = await this.updateRefreshToken(user.accountId, tokens.refreshToken);
    if (!isUpdateRefreshToken.success) {
      console.error('Error: update refresh token failed');
      throw new UnauthorizedException(AuthenticationExceptions.TokenRefreshError);
    }

    return {
      accountId: user.accountId,
      uuid: user.uuid,
      displayName: user.displayName,
      language: user.language,
      avatarUrl: user.avatarUrl,
      ...tokens,
      accessTokenExpiry: new Date(tokens.accessTokenExpiry),
      refreshTokenExpiry: new Date(tokens.refreshTokenExpiry),
    };
  }

  private async authenticateByTmaInitialData(initialDataRaw: string) {
    const initialData = this.parseInitialDataRaw(initialDataRaw);

    const telegramToken = this.configService.getOrThrow('TELEGRAM_BOT_TOKEN');
    const secretKey = crypto
      .createHmac('sha256', TelegramWebAppToken)
      .update(telegramToken)
      .digest();
    const validationKey = crypto
      .createHmac('sha256', secretKey)
      .update(initialData.token)
      .digest('hex');

    const isValidRequest = initialData.hash === validationKey;
    if (!isValidRequest) throw new UnauthorizedException(AuthenticationExceptions.InvalidHash);

    return initialData;
  }

  private async authenticateByTmaData(hash: string, data: LoginTmaOAuthRequest) {
    const telegramToken = this.configService.getOrThrow('TELEGRAM_BOT_TOKEN');
    const dataCheckArr = Object.keys(data)
      .sort()
      .map(key => `${key}=${data[key]}`);

    const dataCheckString = dataCheckArr.join('\n');
    const secretKey = crypto.createHash('sha256').update(telegramToken).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (hmac !== hash) throw new UnauthorizedException(AuthenticationExceptions.InvalidHash);

    return {
      telegramId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      username: data.username,
      avatarUrl: data.photo_url,
    };
  }

  private parseInitialDataRaw(initialDataRaw: string): TelegramInitialData {
    const searchParams = new URLSearchParams(initialDataRaw);

    const hash = searchParams.get('hash');
    const user = searchParams.get('user');
    const authDate = searchParams.get('auth_date');
    const queryId = searchParams.get('query_id');

    if (![hash, user, authDate].every(entry => entry)) {
      throw new UnauthorizedException(AuthenticationExceptions.InvalidParams);
    }

    searchParams.delete('hash');

    const restKeys = Array.from(searchParams.entries());
    restKeys.sort(([a], [b]) => a.localeCompare(b));
    const token = restKeys.map(([n, v]) => `${n}=${v}`).join('\n');

    return {
      token,
      hash,
      metadata: {
        authDate,
        queryId: queryId ?? '',
        user: JSON.parse(user),
      },
    };
  }

  private async getTokens(data: GetTokenRequest) {
    const jwtPayload: JwtPayload = {
      ...data,
      sub: data.uuid,
    };

    const accessTokenJwtSecretKey = this.configService.getOrThrow<string>('AT_JWT_SECRET_KEY');
    const refreshTokenJwtSecretKey = this.configService.getOrThrow<string>('RT_JWT_SECRET_KEY');
    const expiresInAccessTokenJwt = this.configService.getOrThrow<string>(
      'AT_JWT_SECRET_KEY_TIMEOUT'
    );
    const expiresInRefreshTokenJwt = this.configService.getOrThrow<string>(
      'RT_JWT_SECRET_KEY_TIMEOUT'
    );
    const accessTokenExpiry = Date.now() + Number(expiresInAccessTokenJwt) - 300000;
    const refreshTokenExpiry = Date.now() + Number(expiresInRefreshTokenJwt) - 600000;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { ...jwtPayload, type: JwtTokenType.access },
        {
          secret: accessTokenJwtSecretKey,
          expiresIn: expiresInAccessTokenJwt,
        }
      ),
      this.jwtService.signAsync(
        { ...jwtPayload, type: JwtTokenType.refresh },
        {
          secret: refreshTokenJwtSecretKey,
          expiresIn: expiresInRefreshTokenJwt,
        }
      ),
    ]).catch(error => {
      console.error('Error: ', error);
      throw new UnauthorizedException(AuthenticationExceptions.TokenInternalServerError);
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiry,
      refreshTokenExpiry,
    };
  }

  private async updateRefreshToken(accountId: number, rt: string) {
    const hash = await this.handleHash(rt);
    const rtExpiry = this.configService.getOrThrow<string>('RT_JWT_SECRET_KEY_TIMEOUT');
    const refreshTokenExpiry = new Date(Date.now() + Number(rtExpiry) - 600000);

    return await this.userService.updateRefreshToken({
      accountId,
      rt: hash,
      rtExp: refreshTokenExpiry,
    });
  }

  private async handleHash(data: string): Promise<string> {
    return await bcrypt
      .hash(data, 16)
      .then((hash: any): string => hash)
      .catch((error: any): Error => {
        console.error('Error: ', error);
        throw new InternalServerErrorException(ServerExceptions.InternalServerError);
      });
  }
}
