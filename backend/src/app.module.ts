import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UrlsModule } from './urls/urls.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    TypeOrmModule.forRoot(
      process.env.NODE_ENV === 'test'
        ? {
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            autoLoadEntities: true,
          }
        : {
            type: 'postgres',
            host: 'localhost',
            port: 5432,
            username: 'autocado',
            password: 'autocado1',
            database: 'autocado',
            synchronize: true,
            autoLoadEntities: true,
          },
    ),
    AuthModule,
    UrlsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
