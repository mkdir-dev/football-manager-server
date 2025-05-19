import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import {
  GetOrCreateUserAndTgAccountRequest,
  GetOrCreateUserAndTgAccountResponse,
  UpdateUserRefreshTokenRequest,
} from '@infrastructure/types/user.types';
import { ServerExceptions } from '@infrastructure/exceptions/server.exceptions';
import { UserRepository } from 'user/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getOrCreateUserAndTgAccount(
    data: GetOrCreateUserAndTgAccountRequest
  ): Promise<GetOrCreateUserAndTgAccountResponse> {
    try {
      let user = await this.userRepository.getUserByTelegramAccountId(data.telegramId);

      if (!user) {
        user = await this.userRepository.createUserAndTgAccount(data);
      } else {
        await this.userRepository.setLastActiveAt(user.id, new Date());
      }

      return {
        accountId: user.id,
        uuid: user.uuid,
        displayName: user.displayName,
        language: user.language,
        avatarUrl: user.avatarUrl,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new RpcException({
        statusCode: 500,
        message: ServerExceptions.InternalServerError,
      });
    }
  }

  async updateTokenData(data: UpdateUserRefreshTokenRequest): Promise<{ success: boolean }> {
    try {
      const updatedTokenData = await this.userRepository.updateTokenData(data);

      return { success: !!updatedTokenData };
    } catch (error) {
      console.error('Error:', error);
      throw new RpcException({
        statusCode: 500,
        message: ServerExceptions.InternalServerError,
      });
    }
  }

  /*
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
  */

  async setLastActiveAt(accountId: number, lastActiveAt: Date) {
    const user = await this.userRepository.setLastActiveAt(accountId, lastActiveAt);
    return { success: user.id === accountId && lastActiveAt === user.lastActiveAt };
  }
}
