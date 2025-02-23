import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// import { RpcExceptionFilter } from 'infrastructure/utils';
import {
  GatewayMicroserviceName,
  GatewayMicroserviceQueue,
} from '@services/gateway/gateway.constants';
import { AppModule } from 'app/app.module';

async function bootstrap() {
  // NestJS
  const app = await NestFactory.create(AppModule);

  // Config
  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow('PORT');
  const API_GLOBAL_PREFIX = configService.getOrThrow('API_GLOBAL_PREFIX');

  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  /*
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );
  app.useGlobalFilters(new RpcExceptionFilter());
  */

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('"Football Season" API Documentation')
    .setDescription('The API description')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

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
      queue: GatewayMicroserviceQueue,
      noAck: true,
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  await app.listen(PORT);
  Logger.log(
    `🚀 Application ${GatewayMicroserviceName} is running on: http://localhost:${PORT}/${API_GLOBAL_PREFIX}`
  );
}

bootstrap();
