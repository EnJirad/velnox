import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { MerchantsModule } from './merchants/merchants.module';
import { ShopsModule } from './shops/shops.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { VelRepeatModule } from './velrepeat/velrepeat.module';
import { UploadsModule } from './uploads/uploads.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PlatformSettingsModule } from './platform-settings/platform-settings.module';
import { PaymentsModule } from './payments/payments.module';
import { EventsModule } from './events/events.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
        blockDuration: 300000,
      },
      {
        ttl: 900000,
        limit: 1000,
      },
    ]),
    DatabaseModule,
    EventsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CategoriesModule,
    MerchantsModule,
    ShopsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    VelRepeatModule,
    UploadsModule,
    AnalyticsModule,
    PlatformSettingsModule,
    PaymentsModule,
  ],
})
export class AppModule {}