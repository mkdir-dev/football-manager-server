import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';

import {
  GetOrCreateUserAndTgAccountRequest,
  GetOrCreateUserByGoogleOAuthRequest,
  UpdateUserRefreshTokenRequest,
} from '@infrastructure/types/user.types';
import { UserService } from 'user/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @MessagePattern('user.get-or-create-user-and-tg-account.command')
  async getOrCreateUserAndTgAccount(@Payload() payload: GetOrCreateUserAndTgAccountRequest) {
    return this.userService.getOrCreateUserAndTgAccount(payload);
  }

  @MessagePattern('user.get-or-create-user-and-google-account.command')
  async getOrCreateUserByGoogleOAuth(@Payload() payload: GetOrCreateUserByGoogleOAuthRequest) {
    return this.userService.getOrCreateUserAndGoogleOAuth(payload);
  }

  @MessagePattern('user.set-last-active-at.command')
  async setLastActiveAt(@Payload() payload: { accountId: number; lastActiveAt: Date }) {
    return this.userService.setLastActiveAt(payload.accountId, payload.lastActiveAt);
  }

  @MessagePattern('user.update-token-data.command')
  async updateTokenData(@Payload() payload: UpdateUserRefreshTokenRequest) {
    return await this.userService.updateTokenData(payload);
  }

  @MessagePattern('user.get-user-by-id.query')
  async getUserByAccountId(@Payload() payload: { accountId: number }) {
    return this.userService.getUserByAccountId(payload.accountId);
  }

  @MessagePattern('user.get-user-auth-data.query')
  async getUserAuthDataByAccountId(@Payload() payload: { accountId: number }) {
    return this.userService.getUserAuthDataByAccountId(payload.accountId);
  }
}
