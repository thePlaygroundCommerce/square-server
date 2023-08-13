import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { v4 as uidv4 } from 'uuid';
import {
  ApiResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderLineItem,
  OrdersApi,
  RetrieveOrderResponse,
  UpdateOrderRequest,
  UpdateOrderResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Controller('carts')
export class CartsController {
  ordersApi: OrdersApi;

  constructor(SquareClient: SquareClient) {
    this.ordersApi = SquareClient.getClient().ordersApi;
  }

  @Post('create')
  async createCart(
    @Body() { order: { state, lineItems } }: CreateOrderRequest,
  ): Promise<ApiResponse<CreateOrderResponse>> {
    console.log('Create Cart Request Received : ');

    try {
      return await this.ordersApi.createOrder({
        order: {
          locationId: 'LFX4KWJMYHQZ3',
          state,
          lineItems,
        },
        idempotencyKey: uidv4(),
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Put('update/:orderId')
  async updateCart(
    @Body()
    { version, state, lineItems }: { version: number, state: string; lineItems: Array<OrderLineItem> },
    @Param('orderId') orderId: string,
  ): Promise<ApiResponse<UpdateOrderResponse>> {
    console.log('Update Cart Request Received : ' + orderId);

    try {
      const result = await this.ordersApi.updateOrder(orderId, {
        order: {
          locationId: 'LFX4KWJMYHQZ3',
          version,
          state,
          lineItems,
        },
        idempotencyKey: uidv4(),
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  @Get(':orderId')
  async getCart(
    @Param('orderId') orderId,
  ): Promise<ApiResponse<RetrieveOrderResponse>> {
    try {
      console.log('Get Cart Request Received : ' + orderId);
      return await this.ordersApi.retrieveOrder(orderId);
    } catch (error) {
      return error;
    }
  }
}
