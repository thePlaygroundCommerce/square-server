import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Logger,
  Injectable,
  UseFilters,
} from '@nestjs/common';
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
import { SquareClient } from 'src/square-client/square-client';
import {
  ApiErrorFilter,
  OrderApiService,
} from 'src/order-api/order-api.service';

@Injectable()
@Controller('carts')
@UseFilters(ApiErrorFilter)
export class CartsController {
  private logger = new Logger();
  constructor(private orderService: OrderApiService) {}

  @Post('create')
  async createCart(
    @Body() req: CreateOrderRequest,
  ): Promise<ApiResponse<CreateOrderResponse>> {
    return await this.orderService.createOrder(req);
  }

  @Put('update/:orderId')
  async updateCart(
    @Body()
    req: {
      order: { version: number; state: string; lineItems: OrderLineItem[] };
      fieldsToClear: string[];
    },
    @Param('orderId') orderId: string,
  ): Promise<ApiResponse<UpdateOrderResponse>> {
    return await this.orderService.updateOrder(orderId, req);
  }

  @Get(':orderId')
  async getCart(
    @Param('orderId') orderId,
  ): Promise<ApiResponse<RetrieveOrderResponse>> {
    return await this.orderService.getOrder(orderId);
  }
}
