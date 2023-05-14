import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiResponse,
  CheckoutApi,
  CreateCheckoutRequest,
  CreateCheckoutResponse,
  CreatePaymentLinkRequest,
  UpdatePaymentLinkRequest,
  UpdatePaymentLinkResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';
import { v4 as uidv4 } from 'uuid';
// import SquareClient from 'src/main';

@Controller('checkout')
export class CheckoutController {
  checkoutApi: CheckoutApi;

  constructor(SquareClient: SquareClient) {
    this.checkoutApi = SquareClient.getClient().checkoutApi;
  }

  @Post()
  async getCheckoutUrl(
    @Body() { order }: CreatePaymentLinkRequest,
  ): Promise<ApiResponse<UpdatePaymentLinkResponse>> {
    try {
      const { id, orderId, ...rest } = await this.checkoutApi
        .createPaymentLink({
          idempotencyKey: uidv4(),
          order: { locationId: 'LFX4KWJMYHQZ3', lineItems: order.lineItems },
          checkoutOptions: { redirectUrl: 'http://localhost:3000/checkout/' },
        })
        .then((res) => res.result.paymentLink);

      return await this.checkoutApi
        .updatePaymentLink(id, {
          paymentLink: {
            ...rest,
            checkoutOptions: {
              redirectUrl: 'http://localhost:3000/checkout/' + orderId,
            },
          },
        })
    } catch (error) {
      console.log(error);
    }
  }
}
