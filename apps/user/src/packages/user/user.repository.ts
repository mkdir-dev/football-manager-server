import { Injectable } from '@nestjs/common';

import { PrismaRepository } from '@infrastructure/utils';

import {
  GetOrCreateUserAndTgAccountRequest,
  UpdateUserRefreshTokenRequest,
} from '@infrastructure/types/user.types';

@Injectable()
export class UserRepository extends PrismaRepository<'user'> {
  constructor() {
    super('user');
  }

  async getUserByTelegramAccountId(telegramId: number) {
    const telegramAccount = await this.context.telegramAccount.findUnique({
      where: { telegramId },
      include: {
        user: { include: { telegramAccount: true } },
      },
    });

    return telegramAccount?.user;
  }

  async createUserAndTgAccount(data: GetOrCreateUserAndTgAccountRequest) {
    const displayName = data.username || data.firstName || data.lastName || 'Unknown';

    return await this.context.userAccount.create({
      data: {
        displayName,
        language: data.language,
        avatarUrl: data.avatarUrl,
        telegramAccount: {
          create: {
            telegramId: data.telegramId,
            username: data.username,
            firstName: data.firstName,
            lastName: data.lastName,
            avatarUrl: data.avatarUrl,
            language: data.language,
            isAllowsWrite: data.isAllowsWrite,
          },
        },
      },
      include: { telegramAccount: true },
    });
  }

  /*
  async createUser(createUserAccount: CreateUserAccount) {
    const displayName =
      createUserAccount.username ||
      createUserAccount.first_name ||
      createUserAccount.last_name ||
      'Unknown';

    return await this.context.userAccount.create({
      data: {
        displayName,
        avatarUrl: createUserAccount.photo_url ?? '',
        telegramAccount: {
          create: {
            telegramId: createUserAccount.id,
            username: createUserAccount.username,
            firstName: createUserAccount.first_name ?? '',
            lastName: createUserAccount.last_name ?? '',
            avatarUrl: createUserAccount.photo_url ?? '',
            language: createUserAccount.language_code ?? 'en',
            isAllowsWrite: createUserAccount.allows_write_to_pm ?? false,
          },
        },
      },
      include: { telegramAccount: true },
    });
  }
  */

  async setLastActiveAt(accountId: number, lastActiveAt: Date) {
    return await this.context.userAccount.update({
      where: { id: accountId },
      data: { lastActiveAt },
      include: { telegramAccount: true },
    });
  }

  async updateTokenData(data: UpdateUserRefreshTokenRequest) {
    return await this.context.userAccount.update({
      where: { id: data.accountId },
      data: {
        hashRefreshToken: data.rt,
        refreshTokenExpiry: data.rtExp,
      },
      select: {
        id: true,
        hashRefreshToken: true,
        refreshTokenExpiry: true,
      },
    });
  }
}
