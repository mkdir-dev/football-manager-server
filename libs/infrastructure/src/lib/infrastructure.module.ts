import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [CacheService],
  exports: [CacheService],
})
export class InfrastructureModule {}
