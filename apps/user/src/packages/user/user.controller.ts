import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { UserService } from 'user/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @MessagePattern('user.get-or-create.user.command')
  async getOrCreateUser(@Payload() payload: { authorization: string }) {
    return this.userService.getOrCreateUser(payload.authorization);
  }
}
