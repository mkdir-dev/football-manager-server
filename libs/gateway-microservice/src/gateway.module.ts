import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { GatewayMicroserviceName, GatewayMicroserviceQueue } from './gateway.constants';

@Module({
  imports: [
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: GatewayMicroserviceName,
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
                queue: GatewayMicroserviceQueue,
                queueOptions: {
                  durable: true,
                },
              },
            };
          },
        },
      ],
    }),
  ],
})
export class GatewayModule {}
