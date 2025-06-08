import { Body, Controller, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { loginTmaAuthContract, logoutContract } from '@infrastructure/contracts/auth.contracts';
import {
  LoginResponse,
  LoginTmaOAuthRequest,
  LogoutResponse,
} from '@infrastructure/types/auth.types';

import { AuthenticationService } from 'authentication/authentication.service';
import { JwtPayload } from 'authentication/authentication.types';
import { GetUserFromReq } from 'packages/common/decorators/get-current-user.decorator';
import { JwtRefreshGuard } from 'packages/common/guards/jwt-refresh.guard';

@Controller('auth')
@ApiTags('Auth')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @ApiOperation({
    description:
      'Метод авторизации для пользователей вошедших в приложение с помощью Telegram Mini App',
    summary: 'Если пользователя нет, то он будет создан, если есть - обновится lastActiveAt',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponse,
    schema: { example: loginTmaAuthContract },
  })
  @Post('login/tma')
  @HttpCode(HttpStatus.OK)
  async loginTma(@Headers('Authorization') authorization: string) {
    return await this.authenticationService.loginTmaAuth(authorization);
  }

  @ApiOperation({
    description:
      'Метод авторизации для пользователей вошедших в полную версию, но авторизировались по кнопке OAuth Telegram',
    summary: 'Если пользователя нет, то он будет создан, если есть - обновится lastActiveAt',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponse,
    schema: { example: loginTmaAuthContract },
  })
  @Post('login/tma/oauth')
  @HttpCode(HttpStatus.OK)
  async loginTmaOAuth(
    @Headers('Authorization') authorization: string,
    // TODO: добавить валидацию для body в dto
    @Body() body: LoginTmaOAuthRequest
  ) {
    return await this.authenticationService.loginTmaOAuth(authorization, body);
  }

  @ApiOperation({
    description:
      'Метод авторизации для пользователей вошедших в полную версию, но авторизировались по кнопке OAuth Google',
    summary: 'Если пользователя нет, то он будет создан, если есть - обновится lastActiveAt',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponse,
    schema: { example: loginTmaAuthContract },
  })
  @Post('login/google')
  @HttpCode(HttpStatus.OK)
  async loginGoogleOAuth(@Headers('Authorization') authorization: string) {
    return await this.authenticationService.loginGoogleOAuth(authorization);
  }

  @ApiOperation({
    description: 'Метод для обновления токена',
    summary: 'Обновляет access токен пользователя, по переданному refresh токену',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LoginResponse,
    schema: { example: loginTmaAuthContract },
  })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Headers('Authorization') authorization: string,
    @GetUserFromReq() user: JwtPayload
  ) {
    return await this.authenticationService.refreshToken(authorization, user);
  }

  @ApiOperation({
    description: 'Метод для выхода из системы',
    summary: 'Удаляет токены и сессию пользователя по переданному refresh токену',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: LogoutResponse,
    schema: { example: logoutContract },
  })
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Headers('Authorization') authorization: string,
    @GetUserFromReq() user: JwtPayload
  ) {
    return await this.authenticationService.logout(authorization, user);
  }
}
