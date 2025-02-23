import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

// import { UserMicroserviceName, UserMicroserviceQueue } from './user.constants';

@Module({
  imports: [
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [],
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class UserMicroserviceModule {}
