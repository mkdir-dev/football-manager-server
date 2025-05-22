import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import {
  UserAccount,
  GetOrCreateUserAndTgAccountRequest,
  GetOrCreateUserResponse,
  GetOrCreateUserByGoogleOAuthRequest,
  UpdateUserRefreshTokenRequest,
  UserAccountAuthData,
} from '@infrastructure/types/user.types';
import { UserMicroserviceName } from '@services/user/user.constants';

@Injectable()
export class UserService {
  constructor(@Inject(UserMicroserviceName) private userClient: ClientProxy) {}

  async getOrCreateUserByTgInitData(data: GetOrCreateUserAndTgAccountRequest) {
    const getOrCreateUser$ = this.userClient.send<GetOrCreateUserResponse>(
      'user.get-or-create-user-and-tg-account.command',
      data
    );

    return await firstValueFrom(getOrCreateUser$);
  }

  async getOrCreateUserByGoogleOAuth(data: GetOrCreateUserByGoogleOAuthRequest) {
    const getOrCreateUser$ = this.userClient.send<GetOrCreateUserResponse>(
      'user.get-or-create-user-and-google-account.command',
      data
    );
    return await firstValueFrom(getOrCreateUser$);
  }

  async setLastActiveAt(accountId: number, lastActiveAt: Date) {
    const setLastActiveAt$ = this.userClient.send<{ success: boolean }>(
      'user.set-last-active-at.command',
      { accountId, lastActiveAt }
    );

    return await firstValueFrom(setLastActiveAt$);
  }

  async updateRefreshToken(data: UpdateUserRefreshTokenRequest) {
    const updateTokenData$ = this.userClient.send<{ success: boolean }>(
      'user.update-token-data.command',
      data
    );

    return await firstValueFrom(updateTokenData$);
  }

  async getUserByAccountId(accountId: number) {
    const getCurrentUser$ = this.userClient.send<UserAccount>('user.get-user-by-id.query', {
      accountId,
    });

    return await firstValueFrom(getCurrentUser$);
  }

  async getUserAuthDataByAccountId(accountId: number) {
    const getCurrentUser$ = this.userClient.send<UserAccountAuthData>(
      'user.get-user-auth-data.query',
      { accountId }
    );

    return await firstValueFrom(getCurrentUser$);
  }
}
