import { Controller, Get, Headers } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from 'user/user.service';

@Controller('user')
@ApiTags('User')
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
  @Get()
  async getUser(@Headers('Authorization') authorization: string) {
    return await this.userService.getUser(authorization);
  }
}
