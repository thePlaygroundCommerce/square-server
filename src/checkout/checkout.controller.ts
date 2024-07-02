import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import {
  ApiResponse,
  CheckoutApi,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  CreatePaymentLinkRequest,
  OrdersApi,
  RetrieveOrderResponse,
  UpdatePaymentLinkRequest,
  UpdatePaymentLinkResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';
import { v4 as uidv4 } from 'uuid';

@Controller('checkout')
export class CheckoutController {
  checkoutApi: CheckoutApi;
  ordersApi: OrdersApi;

  constructor(SquareClient: SquareClient) {
    this.checkoutApi = SquareClient.getClient().checkoutApi;
    this.ordersApi = SquareClient.getClient().ordersApi;
  }

  @Post()
  async getCheckoutUrl(
    @Body() { order, checkoutOptions }: CreatePaymentLinkRequest,
  ): Promise<ApiResponse<UpdatePaymentLinkResponse>> {
    try {
      const { id, orderId, ...rest } = await this.checkoutApi
        .createPaymentLink({
          idempotencyKey: uidv4(),
          order: {
            locationId: process.env.SQUARE_MAIN_LOCATION_ID,
            lineItems: order.lineItems,
          },
        })
        .then((res) => res.result.paymentLink)
        .catch((err) => {
          console.log(err);
          return err;
        });

      return await this.checkoutApi.updatePaymentLink(id, {
        paymentLink: {
          ...rest,
          checkoutOptions: {
            redirectUrl:
              checkoutOptions && checkoutOptions.redirectUrl + orderId,
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  @Get(['order/:orderId'])
  async getOrder(
    @Param() { orderId },
  ): Promise<ApiResponse<RetrieveOrderResponse>> {
    try {
      return await this.ordersApi.retrieveOrder(orderId);
    } catch (error) {
      console.log(error);
    }
  }
}
