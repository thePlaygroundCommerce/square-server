import { Module } from '@nestjs/common';
import { CartsController } from './carts/carts.controller';
import { CatalogController } from './catalog/catalog.controller';
import { CheckoutController } from './checkout/checkout.controller';
import { ConfigModule } from '@nestjs/config';
import { SquareClient } from './square-client/square-client';
import { CatalogApiService } from './catalog-api/catalog-api.service';
import { OrderApiService } from './order-api/order-api.service';
import { CustomerController } from './customer/customer.controller';
import { CategoriesController } from './categories/categories.controller';
import { CustomersController } from './customers/customers.controller';

@Module({
  imports: [
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
    CustomersController,
  ],
  providers: [ SquareClient, CatalogApiService, OrderApiService]
})
export class AppModule {}
