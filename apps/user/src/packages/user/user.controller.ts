import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import {
  GetOrCreateUserAndTgAccountRequest,
  UpdateUserRefreshTokenRequest,
} from '@infrastructure/types/user.types';
import { UserService } from 'user/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // user.get-or-create-user-and-tg-account.command
  @MessagePattern('user.get-or-create-user-and-tg-account.command')
  async getOrCreateUserAndTgAccount(@Payload() payload: GetOrCreateUserAndTgAccountRequest) {
    return this.userService.getOrCreateUserAndTgAccount(payload);
  }

  /*
  @MessagePattern('user.get-or-create-user.command')
  async getOrCreateUser(@Payload() payload: { authorization: string }) {
    return this.userService.getOrCreateUser(payload.authorization);
  }
  */

  @MessagePattern('user.set-last-active-at.command')
  async setLastActiveAt(@Payload() payload: { accountId: number; lastActiveAt: Date }) {
    return this.userService.setLastActiveAt(payload.accountId, payload.lastActiveAt);
  }

  @MessagePattern('user.update-token-data.command')
  async updateTokenData(@Payload() payload: UpdateUserRefreshTokenRequest) {
    return await this.userService.updateTokenData(payload);
  }
}
