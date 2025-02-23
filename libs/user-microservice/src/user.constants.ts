import { Inject } from '@nestjs/common';
import { ClientsProviderAsyncOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const UserMicroserviceName = 'USER_SERVICE';
export const UserMicroserviceQueue = 'user-queue';

export const UserClient: ClientsProviderAsyncOptions = {
  name: UserMicroserviceName,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const [user, password, host, port] = [
      configService.getOrThrow('RABBITMQ_USER'),
      configService.getOrThrow('RABBITMQ_PASS'),
      configService.getOrThrow('RABBITMQ_HOST'),
      configService.getOrThrow('RABBITMQ_PORT'),
    ];

    return {
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${user}:${password}@${host}:${port}`],
        queue: UserMicroserviceQueue,
        queueOptions: { durable: true },
      },
    };
  },
};
