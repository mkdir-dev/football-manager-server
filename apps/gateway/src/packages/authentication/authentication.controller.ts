import { Controller, Get, Headers, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { loginTmaAuthContract } from '@infrastructure/contracts/auth.contract';
import { LoginTmaAuthResponse } from '@infrastructure/types/auth.types';

// import { AuthenticationGuard } from 'authentication/authentication.guard';
import { AuthenticationService } from 'authentication/authentication.service';

@Controller('auth')
@ApiTags('Auth')
// @UseGuards(AuthenticationGuard)
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @ApiOperation({
    description:
      'Метод авторизации для пользователей вошедших в приложение с помощью Telegram Mini App',
    summary: 'Если пользователя нет, то он будет создан, если есть - обновится lastActiveAt',
  })
  @ApiResponse({
    status: 200,
    type: LoginTmaAuthResponse,
    schema: { example: loginTmaAuthContract },
  })
  @Post('login/tma')
  async loginTma(@Headers('Authorization') authorization: string) {
    return await this.authenticationService.loginTmaAuth(authorization);
  }

  /*
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
  */
}
