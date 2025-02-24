import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { UserMicroserviceName } from '@services/user/user.constants';

@Injectable()
export class UserService {
  constructor(@Inject(UserMicroserviceName) private userClient: ClientProxy) {}

  async getOrCreateUser(authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException({
        statusCode: 401,
        status: 'error',
        message: 'Unauthorized',
      });
    }

    const getUser$ = this.userClient.send<{
      accountId: number;
      displayName: string;
      avatarUrl: string | null;
      language: string | null;
    }>('user.get-or-create-user.command', {
      authorization,
    });

    return await firstValueFrom(getUser$);
  }

  async setLastActiveAt(accountId: number, lastActiveAt: Date) {
    const setLastActiveAt$ = this.userClient.send<{ success: boolean }>(
      'user.set-last-active-at.command',
      { accountId, lastActiveAt }
    );

    return await firstValueFrom(setLastActiveAt$);
  }
}
