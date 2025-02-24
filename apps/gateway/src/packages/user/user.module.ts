import { Module } from '@nestjs/common';

import { AuthenticationService } from 'authentication/authentication.service';
import { AuthenticationGuard } from 'authentication/authentication.guard';

import { UserController } from 'user/user.controller';
import { UserService } from 'user/user.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [AuthenticationService, AuthenticationGuard, UserService],
  exports: [AuthenticationService, AuthenticationGuard],
})
export class UserModule {}
