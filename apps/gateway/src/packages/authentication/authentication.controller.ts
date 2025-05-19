import { Body, Controller, Get, Headers, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { loginTmaAuthContract } from '@infrastructure/contracts/auth.contract';
import { LoginResponse, LoginTmaOAuthRequest } from '@infrastructure/types/auth.types';

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
    type: LoginResponse,
    schema: { example: loginTmaAuthContract },
  })
  @Post('login/tma')
  @HttpCode(200)
  async loginTma(@Headers('Authorization') authorization: string) {
    return await this.authenticationService.loginTmaAuth(authorization);
  }

  @ApiOperation({
    description:
      'Метод авторизации для пользователей вошедших в полную версию, но авторизировались по кнопке OAuth Telegram',
    summary: 'Если пользователя нет, то он будет создан, если есть - обновится lastActiveAt',
  })
  @ApiResponse({
    status: 200,
    type: LoginResponse,
    schema: { example: loginTmaAuthContract },
  })
  @Post('login/tma/oauth')
  @HttpCode(200)
  async loginTmaOAuth(
    @Headers('Authorization') authorization: string,
    // TODO: добавить валидацию для body в dto
    @Body() body: LoginTmaOAuthRequest
  ) {
    return await this.authenticationService.loginTmaOAuth(authorization, body);
  }

  // login/google
  @ApiOperation({
    description:
      'Метод авторизации для пользователей вошедших в полную версию, но авторизировались по кнопке OAuth Google',
    summary: 'Если пользователя нет, то он будет создан, если есть - обновится lastActiveAt',
  })
  @ApiResponse({
    status: 200,
    type: LoginResponse,
    schema: { example: loginTmaAuthContract },
  })
  @Post('login/google')
  @HttpCode(200)
  async loginGoogleOAuth(@Headers('Authorization') authorization: string) {
    return await this.authenticationService.loginGoogleOAuth(authorization);
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
