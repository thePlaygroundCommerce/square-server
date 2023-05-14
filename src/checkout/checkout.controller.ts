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
import { JsonUtil } from 'src/json-util/json-util';
import { SquareClient } from 'src/square-client/square-client';
import { v4 as uidv4 } from 'uuid';
// import SquareClient from 'src/main';

@Controller('checkout')
export class CheckoutController {
  checkoutApi: CheckoutApi;
  jsonUtil: JsonUtil;

  constructor(SquareClient: SquareClient, jsonUtil: JsonUtil) {
    this.checkoutApi = SquareClient.getClient().checkoutApi;
    this.jsonUtil = jsonUtil;
  }

  @Post()
  async getCheckoutUrl(
    @Body() { order }: CreatePaymentLinkRequest,
  ): Promise<string> {
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
        .then((res) => this.jsonUtil.prepareForTransport(res));
    } catch (error) {
      console.log(error);
    }
  }
}
