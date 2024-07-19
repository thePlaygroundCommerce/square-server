import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
  Logger,
  UseFilters,
} from '@nestjs/common';
import { SquareClient } from 'src/square-client/square-client';
import { v4 as uidv4 } from 'uuid';
import {
  ApiError,
  ApiResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  OrderLineItem,
  OrdersApi,
  RetrieveOrderResponse,
  UpdateOrderResponse,
} from 'square';
import { Response } from 'express';

@Catch(ApiError)
export class ApiErrorFilter implements ExceptionFilter<ApiError> {
  private readonly logger = new Logger(ApiError.name);
  catch(exception: ApiError, host: ArgumentsHost) {
    this.logger.error(exception.errors);
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    return res.json(exception);
  }
}

@Injectable()
export class OrderApiService {
  private readonly logger = new Logger(OrderApiService.name);
  private ordersApi: OrdersApi;

  constructor(SquareClient: SquareClient) {
    this.ordersApi = SquareClient.getClient().ordersApi;
  }
  async getOrder(orderId: string): Promise<ApiResponse<RetrieveOrderResponse>> {
    return await this.ordersApi.retrieveOrder(orderId);
  }
  async createOrder({
    order: { state, lineItems },
  }: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
    return await this.ordersApi.createOrder({
      order: {
        locationId: process.env.SQUARE_MAIN_LOCATION_ID,
        state,
        lineItems,
      },
      idempotencyKey: uidv4(),
    });
  }

  async updateOrder(
    orderId: string,
    {
      order: { version, state, lineItems },
      fieldsToClear,
    }: {
      order: Order;
      fieldsToClear: string[];
    },
  ): Promise<ApiResponse<UpdateOrderResponse>> {
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
  }
}
