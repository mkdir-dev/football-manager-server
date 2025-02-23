import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { UserMicroserviceName, UserMicroserviceQueue } from '@services/user/user.constants';

import { AppModule } from 'app/app.module';

async function bootstrap() {
  // NestJS
  const app = await NestFactory.create(AppModule);

  // Config
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT');
  const API_GLOBAL_PREFIX = configService.get('API_GLOBAL_PREFIX');

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.useGlobalPipes(new ValidationPipe());

  // RabbitMQ
  const [user, password, host, port] = [
    configService.getOrThrow('RABBITMQ_USER'),
    configService.getOrThrow('RABBITMQ_PASS'),
    configService.getOrThrow('RABBITMQ_HOST'),
    configService.getOrThrow('RABBITMQ_PORT'),
  ];

  const connectionURL = `amqp://${user}:${password}@${host}:${port}`;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [connectionURL],
      queue: UserMicroserviceQueue,
      noAck: true,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(PORT);
  Logger.log(
    `🚀 Application ${UserMicroserviceName} is running on: http://localhost:${PORT}/${API_GLOBAL_PREFIX}`
  );
}

bootstrap();
