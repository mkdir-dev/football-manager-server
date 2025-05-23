import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from '@nestjs/microservices';

import { InfrastructureModule } from '@infrastructure';
import { UserClient } from '@services/user/user.constants';

import configuration from 'config/configuration';

import { AuthenticationModule } from 'authentication/authentication.module';
import { UserModule } from 'user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [UserClient],
    }),
    InfrastructureModule,
    AuthenticationModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
