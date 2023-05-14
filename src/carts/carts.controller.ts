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
import { JsonUtil } from 'src/json-util/json-util';

@Controller('carts')
export class CartsController {
  ordersApi: OrdersApi;
  jsonUtil: JsonUtil;

  constructor(SquareClient: SquareClient, jsonUtil: JsonUtil) {
    this.ordersApi = SquareClient.getClient().ordersApi;
    this.jsonUtil = jsonUtil;
  }

  @Post('create')
  async createCart(@Body() { order }: CreateOrderRequest): Promise<string> {
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
        })
        .then((res) => this.jsonUtil.prepareForTransport(res));
    } catch (error) {
      console.log(error);
    }
  }

  @Put(['update', ':orderId'])
  async updateCart(
    @Body() { order }: UpdateOrderRequest,
    @Param('orderId') { orderId }: { orderId: string },
  ): Promise<string> {
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
        .then((res) => this.jsonUtil.prepareForTransport(res));
    } catch (error) {
      console.log(error);
    }
  }

  @Get(':orderId')
  async getCart(
    @Param('orderId') { orderId }: { orderId: string },
  ): Promise<string> {
    try {
      return await this.ordersApi
        .retrieveOrder(orderId)
        .then((res) => this.jsonUtil.prepareForTransport(res));
    } catch (error) {
      return error;
    }
  }

  
}
