import { Module } from '@nestjs/common';

import { UserController } from 'user/user.controller';
import { UserService } from 'user/user.service';
// import { UserRepository } from './user.repository';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    // UserRepository
  ],
})
export class UserModule {}
