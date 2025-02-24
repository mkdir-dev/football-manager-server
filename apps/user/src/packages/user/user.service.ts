import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import { UserRepository } from 'user/user.repository';
import { CreateUserAccount } from 'user/user.types';
import { UserExceptions } from 'user/user.exceptions';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getOrCreateUser(authorization: string) {
    if (!authorization) {
      throw new RpcException({
        statusCode: 401,
        message: UserExceptions.Unauthorized,
      });
    }

    const params = new URLSearchParams(authorization);
    const userData = params.get('user');

    const telegramUserData: CreateUserAccount = JSON.parse(decodeURIComponent(userData ?? ''));

    if (!telegramUserData) {
      throw new RpcException({
        statusCode: 400,
        message: UserExceptions.InvalidTelegramUserData,
      });
    }
    const user = await this.userRepository.getUserByTelegramAccountId(telegramUserData.id);
    if (!user) {
      const newUser = await this.userRepository.createUser(telegramUserData);

      return {
        accountId: newUser.id,
        displayName: newUser.displayName,
        avatarUrl: newUser.avatarUrl,
        language: newUser.telegramAccount.language,
      };
    }

    return {
      accountId: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      language: user.telegramAccount.language,
    };
  }

  async setLastActiveAt(accountId: number, lastActiveAt: Date) {
    const user = await this.userRepository.setLastActiveAt(accountId, lastActiveAt);
    return { success: user.id === accountId && lastActiveAt === user.lastActiveAt };
  }
}
