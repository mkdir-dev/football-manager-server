import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

import { AuthenticationExceptions } from '@infrastructure/exceptions/auth.exceptions';
import { ServerExceptions } from '@infrastructure/exceptions/server.exceptions';
import { LoginTmaAuthResponse } from '@infrastructure/types/auth.types';

import { UserService } from 'user/user.service';

import {
  GetTokenRequest,
  JwtPayload,
  TelegramInitialData,
} from 'authentication/authentication.types';
import { TelegramWebAppToken } from 'authentication/authentication.constants';

@Injectable()
export class AuthenticationService {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async loginTmaAuth(initialDataRaw: string): Promise<LoginTmaAuthResponse> {
    try {
      if (!initialDataRaw || typeof initialDataRaw !== 'string') {
        throw new UnauthorizedException(
          AuthenticationExceptions.AuthorizationHeaderIsMissingOrInvalid
        );
      }

      const initialData = await this.authenticateByTmaInitialData(initialDataRaw);

      const user = await this.userService.getOrCreateUserByTgInitData({
        telegramId: initialData.metadata.user.id,
        firstName: initialData.metadata.user.first_name,
        lastName: initialData.metadata.user.last_name,
        username: initialData.metadata.user.username,
        avatarUrl: initialData.metadata.user.photo_url,
        isAllowsWrite: initialData.metadata.user.allows_write_to_pm,
        language: initialData.metadata.user.language_code,
      });

      const tokens = await this.getTokens({
        id: user.accountId,
        uuid: user.uuid,
        displayName: user.displayName,
      });

      const isUpdateRefreshToken = await this.updateRefreshToken(
        user.accountId,
        tokens.refreshToken
      );

      if (!isUpdateRefreshToken.success) {
        throw new UnauthorizedException(AuthenticationExceptions.Unauthorized);
      }

      return {
        ...user,
        ...tokens,
        accessTokenExpiry: new Date(tokens.accessTokenExpiry),
        refreshTokenExpiry: new Date(tokens.refreshTokenExpiry),
      };
    } catch (error) {
      console.error('Error: ', error);
      throw new UnauthorizedException(AuthenticationExceptions.Unauthorized);
    }
  }

  private async authenticateByTmaInitialData(initialDataRaw: string) {
    const initialData = this.parseInitialDataRaw(initialDataRaw);

    const telegramToken = this.configService.getOrThrow('TELEGRAM_BOT_TOKEN');
    let secretKey = await this.createSecretKey(telegramToken);

    const validationKey = await this.createValidationKey(initialData.token, secretKey);
    const isValidRequest = initialData.hash === validationKey;
    if (!isValidRequest) throw new UnauthorizedException(AuthenticationExceptions.InvalidHash);

    return initialData;
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

  private async createSecretKey(telegramToken: string) {
    const secretKey = crypto
      .createHmac('sha256', TelegramWebAppToken)
      .update(telegramToken)
      .digest();

    return secretKey;
  }

  private async createValidationKey(initialDataToken: string, secretKey: Buffer) {
    return crypto.createHmac('sha256', secretKey).update(initialDataToken).digest('hex');
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
      this.jwtService.signAsync(jwtPayload, {
        secret: accessTokenJwtSecretKey,
        expiresIn: expiresInAccessTokenJwt,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: refreshTokenJwtSecretKey,
        expiresIn: expiresInRefreshTokenJwt,
      }),
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
      .catch((error): Error => {
        console.error('Error: ', error);
        throw new InternalServerErrorException(ServerExceptions.InternalServerError);
      });
  }
}
