import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

import { Injectable } from '@nestjs/common';

@Injectable()
export class CacheService extends Redis {
  constructor(private configService: ConfigService) {
    const [host, port, password] = [
      configService.getOrThrow<string>('REDIS_HOST'),
      configService.getOrThrow<number>('REDIS_PORT'),
      configService.getOrThrow<string>('REDIS_PASS'),
    ];

    super({
      host,
      port,
      password,
    });
  }
}
