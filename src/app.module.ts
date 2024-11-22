import { Module } from '@nestjs/common';
import { CartsController } from './carts/carts.controller';
import { CatalogController } from './catalog/catalog.controller';
import { CheckoutController } from './checkout/checkout.controller';
import { ConfigModule } from '@nestjs/config';
import { SquareClient } from './square-client/square-client';
import { CatalogApiService } from './services/catalog/catalog.service';
import { OrderApiService } from './order-api/order-api.service';
import { CustomerController } from './customer/customer.controller';
import { CategoriesController } from './categories/categories.controller';
import { CheckoutService } from './checkout/checkout.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true
    }),
    ConfigModule.forRoot({
      envFilePath: '.env.local',
    }),
  ],
  controllers: [
    CartsController,
    CatalogController,
    CheckoutController,
    CustomerController,
    CategoriesController,
  ],
  providers: [
    SquareClient,
    CatalogApiService,
    OrderApiService,
    CheckoutService,
  ],
})
export class AppModule {}
