import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { UploadModule } from './upload/upload.module';
import { SettingsModule } from './settings/settings.module';
import { DiscountsModule } from './discounts/discounts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limit global: 120 req/min por IP (los endpoints sensibles tienen límites propios)
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    CatalogModule,
    OrdersModule,
    UploadModule,
    SettingsModule,
    DiscountsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
