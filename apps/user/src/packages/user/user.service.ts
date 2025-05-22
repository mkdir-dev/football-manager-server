import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

import {
  GetOrCreateUserAndTgAccountRequest,
  GetOrCreateUserByGoogleOAuthRequest,
  GetOrCreateUserResponse,
  UpdateUserRefreshTokenRequest,
  UserAccount,
} from '@infrastructure/types/user.types';
import { UserExceptions } from '@infrastructure/exceptions/user.exceptions';
import { ServerExceptions } from '@infrastructure/exceptions/server.exceptions';
import { UserRepository } from 'user/user.repository';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getOrCreateUserAndTgAccount(
    data: GetOrCreateUserAndTgAccountRequest
  ): Promise<GetOrCreateUserResponse> {
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
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ServerExceptions.InternalServerError,
      });
    }
  }

  async getOrCreateUserAndGoogleOAuth(data: GetOrCreateUserByGoogleOAuthRequest) {
    //
    try {
      let user = await this.userRepository.getUserByGoogleId(data.googleId);

      if (!user) {
        user = await this.userRepository.createUserAndGoogleAccount(data);
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
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
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
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ServerExceptions.InternalServerError,
      });
    }
  }

  async setLastActiveAt(accountId: number, lastActiveAt: Date) {
    try {
      const user = await this.userRepository.setLastActiveAt(accountId, lastActiveAt);
      return { success: user.id === accountId && lastActiveAt === user.lastActiveAt };
    } catch (error) {
      console.error('Error:', error);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ServerExceptions.InternalServerError,
      });
    }
  }

  async getUserByAccountId(accountId: number): Promise<UserAccount> {
    try {
      const user = await this.userRepository.getUserByAccountId(accountId);

      if (!user) {
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: UserExceptions.UserNotFound,
        });
      }

      return {
        accountId: user.id,
        uuid: user.uuid,
        displayName: user.displayName,
        language: user.language,
        avatarUrl: user.avatarUrl,
        email: user.email,
        telegramAccount: {
          telegramAccountId: user.telegramAccount.id,
          telegramId: user.telegramAccount.telegramId,
          username: user.telegramAccount.username,
          firstName: user.telegramAccount.firstName,
          lastName: user.telegramAccount.lastName,
          avatarUrl: user.telegramAccount.avatarUrl,
          language: user.telegramAccount.language,
          isAllowsWrite: user.telegramAccount.isAllowsWrite,
        },
        googleAccount: {
          googleAccountId: user.googleAccount.id,
          googleId: user.googleAccount.googleId,
          username: user.googleAccount.username,
          firstName: user.googleAccount.firstName,
          lastName: user.googleAccount.lastName,
          avatarUrl: user.googleAccount.avatarUrl,
          email: user.googleAccount.email,
          isVerifiedEmail: user.googleAccount.isVerifiedEmail,
        },
      };
    } catch (error) {
      console.error('Error:', error);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ServerExceptions.InternalServerError,
      });
    }
  }

  async getUserAuthDataByAccountId(accountId: number) {
    try {
      const user = await this.userRepository.getUserAuthDataByAccountId(accountId);

      if (!user) {
        throw new RpcException({
          statusCode: HttpStatus.NOT_FOUND,
          message: UserExceptions.UserNotFound,
        });
      }

      if (!user.hashRefreshToken || !user.refreshTokenExpiry) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: UserExceptions.UserNotAuthorized,
        });
      }

      return {
        accountId: user.id,
        uuid: user.uuid,
        displayName: user.displayName,
        hashRefreshToken: user.hashRefreshToken,
        refreshTokenExpiry: user.refreshTokenExpiry,
      };
    } catch (error) {
      console.error('Error:', error);
      throw new RpcException({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: ServerExceptions.InternalServerError,
      });
    }
  }
}
