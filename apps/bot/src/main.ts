import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from 'packages/app/app.module';

async function bootstrap() {
  // NestJS
  const app = await NestFactory.create(AppModule);

  // Config
  const configService = app.get(ConfigService);
  const PORT: number = configService.getOrThrow('PORT') ?? 4000;

  await app.listen(PORT);

  Logger.log(`🚀 Application BOT is running on: http://localhost:${PORT}`);
}

bootstrap();
