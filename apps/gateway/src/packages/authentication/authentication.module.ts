import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthenticationController } from 'authentication/authentication.controller';
import { AuthenticationService } from 'authentication/authentication.service';
// import { AuthenticationGuard } from 'authentication/authentication.guard';

import { UserModule } from 'packages/user/user.module';
import { AccessTokenStrategy } from 'packages/authentication/strategies/access-token.strategy';
import { RefreshTokenStrategy } from 'packages/authentication/strategies/refresh-token.strategy';

@Module({
  imports: [UserModule, JwtModule.register({})],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    // AuthenticationGuard,
    AccessTokenStrategy,
    RefreshTokenStrategy,
  ],
  exports: [
    AuthenticationService,
    // AuthenticationGuard
  ],
})
export class AuthenticationModule {}
