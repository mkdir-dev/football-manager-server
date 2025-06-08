import { Injectable } from '@nestjs/common';

import { PrismaRepository } from '@infrastructure/utils';

import {
  GetOrCreateUserAndTgAccountRequest,
  GetOrCreateUserByGoogleOAuthRequest,
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
        user: {
          include: {
            telegramAccount: true,
            googleAccount: true,
          },
        },
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
      include: { telegramAccount: true, googleAccount: true },
    });
  }

  async getUserByGoogleId(googleId: string) {
    const googleAccount = await this.context.googleAccount.findUnique({
      where: { googleId },
      include: {
        user: { include: { telegramAccount: true, googleAccount: true } },
      },
    });
    return googleAccount?.user;
  }

  async createUserAndGoogleAccount(data: GetOrCreateUserByGoogleOAuthRequest) {
    const displayName = data.username || data.firstName || data.lastName || 'Unknown';

    return await this.context.userAccount.create({
      data: {
        displayName,
        avatarUrl: data.avatarUrl,
        googleAccount: {
          create: {
            googleId: data.googleId,
            username: data.username ?? displayName,
            firstName: data.firstName ?? '',
            lastName: data.lastName,
            avatarUrl: data.avatarUrl,
            email: data.email,
            isVerifiedEmail: data.isVerifiedEmail,
          },
        },
      },
      include: { telegramAccount: true, googleAccount: true },
    });
  }

  async setLastActiveAt(accountId: number, lastActiveAt: Date) {
    return await this.context.userAccount.update({
      where: { id: accountId },
      data: { lastActiveAt },
      include: { telegramAccount: true, googleAccount: true },
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

  async getUserByAccountId(accountId: number) {
    return await this.context.userAccount.findUnique({
      where: { id: accountId },
      include: {
        telegramAccount: true,
        googleAccount: true,
      },
    });
  }

  async getUserAuthDataByAccountId(accountId: number) {
    return await this.context.userAccount.findUnique({
      where: { id: accountId },
      select: {
        id: true,
        uuid: true,
        displayName: true,
        hashRefreshToken: true,
        refreshTokenExpiry: true,
      },
    });
  }
}
