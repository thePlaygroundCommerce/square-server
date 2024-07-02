import { Injectable, Logger } from '@nestjs/common';
import { SquareClient } from 'src/square-client/square-client';
import { v4 as uidv4 } from 'uuid';
import {
  ApiResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  OrderLineItem,
  OrdersApi,
  RetrieveOrderResponse,
  UpdateOrderResponse,
} from 'square';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  private ordersApi: OrdersApi;

  constructor(SquareClient: SquareClient) {
    this.ordersApi = SquareClient.getClient().ordersApi;
  }
  async getOrder(orderId: string): Promise<ApiResponse<RetrieveOrderResponse>> {
    try {
      return await this.ordersApi.retrieveOrder(orderId);
    } catch (error) {
      return error.result;
    }
  }
  async createOrder({
    order: { state, lineItems },
  }: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
    try {
      return await this.ordersApi.createOrder({
        order: {
          locationId: process.env.SQUARE_MAIN_LOCATION_ID,
          state,
          lineItems,
        },
        idempotencyKey: uidv4(),
      });
    } catch (error) {
      return error;
    }
  }
  async updateOrder(
    orderId: string,
    {
      order: { version, state, lineItems },
      fieldsToClear,
    }: {
      order: { version: number; state: string; lineItems: OrderLineItem[] };
      fieldsToClear: string[];
    },
  ): Promise<ApiResponse<UpdateOrderResponse>> {
    try {
      const result = await this.ordersApi.updateOrder(orderId, {
        order: {
          locationId: process.env.SQUARE_MAIN_LOCATION_ID,
          version,
          state,
          lineItems,
        },
        fieldsToClear,
        idempotencyKey: uidv4(),
      });
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}
