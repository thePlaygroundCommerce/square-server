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
  async createCart(@Body() { order }: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
    const { state, lineItems } = order;

    try {
      return await this.ordersApi
        .createOrder({
          order: {
            locationId: 'LFX4KWJMYHQZ3',
            state: state,
            lineItems,
          },
          idempotencyKey: uidv4(),
        });
    } catch (error) {
      console.log(error);
    }
  }

  @Put(['update', ':orderId'])
  async updateCart(
    @Body() { order }: UpdateOrderRequest,
    @Param('orderId') { orderId }: { orderId: string },
  ): Promise<ApiResponse<UpdateOrderResponse>> {
    const { state, lineItems } = order;

    try {
      return await this.ordersApi
        .updateOrder(orderId, {
          order: {
            locationId: 'LFX4KWJMYHQZ3',
            state: state,
            lineItems,
          },
          idempotencyKey: uidv4(),
        })
    } catch (error) {
      console.log(error);
    }
  }

  @Get(':orderId')
  async getCart(
    @Param('orderId') { orderId }: { orderId: string },
  ): Promise<ApiResponse<RetrieveOrderResponse>> {
    try {
      return await this.ordersApi
        .retrieveOrder(orderId)
    } catch (error) {
      return error;
    }
  }

  
}
