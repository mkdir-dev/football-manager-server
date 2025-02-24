import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as crypto from 'crypto';

import { TelegramInitialData } from 'authentication/authentication.types';
import { TelegramWebAppToken } from 'authentication/authentication.constants';
import { AuthenticationExceptions } from 'authentication/authentication.exceptions';

@Injectable()
export class AuthenticationService {
  constructor(private configService: ConfigService) {}

  async authenticateByInitialData(initialDataRaw: string) {
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
      hash,
      token,
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
}
