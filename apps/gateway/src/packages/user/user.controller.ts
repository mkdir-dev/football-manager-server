import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticationGuard } from 'authentication/authentication.guard';
import { UserService } from 'user/user.service';

@Controller('user')
@ApiTags('User')
@UseGuards(AuthenticationGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    description: 'Метод для получения текущего аккаунта',
  })
  @ApiResponse({
    schema: {
      example: {},
      description: 'В случае успеха возвращает ID пользователя в системе',
    },
  })
  @Get('init')
  async getOrCreateUser(@Headers('Authorization') authorization: string) {
    return await this.userService.getOrCreateUser(authorization);
  }
}
