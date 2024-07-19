import { Injectable, Logger } from '@nestjs/common';
import {
  CheckoutApi,
  CheckoutOptions,
  CreatePaymentLinkRequest,
  OrdersApi,
} from 'square';
import { v4 as uidv4 } from 'uuid';
import { OrderApiService } from 'src/order-api/order-api.service';
import { SquareClient } from 'src/square-client/square-client';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private checkoutApi: CheckoutApi;

  constructor(
    SquareClient: SquareClient,
    private orderService: OrderApiService,
  ) {
    this.checkoutApi = SquareClient.getClient().checkoutApi;
  }

  async processOrderCheckout(id: string, options: CheckoutOptions) {
    const {
      result: { order },
    } = await this.orderService.getOrder(id);
    if (!order) {
    } //somethings wrong

    const {
      result: {
        paymentLink: { id: paymentLinkId, orderId, version },
      },
    } = await this.checkoutApi.createPaymentLink({
      idempotencyKey: uidv4(),
      order: {
        locationId: order.locationId,
        lineItems: order.lineItems.map(({ catalogObjectId, quantity }) => ({
          catalogObjectId,
          quantity,
        })),
      },
      checkoutOptions: options,
    });

    const redirect = new URL(options.redirectUrl);
    redirect.pathname += `/${orderId}`;
    redirect.searchParams.set(
      'redirect',
      redirect.searchParams.get('redirect') + `/${orderId}`,
    );

    options.redirectUrl = redirect.toString();

    return await this.checkoutApi.updatePaymentLink(paymentLinkId, {
      paymentLink: {
        version,
        checkoutOptions: options,
      },
    });
  }

  async processItemCheckout({
    order,
    checkoutOptions,
  }: CreatePaymentLinkRequest) {
    const {
      result: {
        paymentLink: { id: paymentLinkId, orderId, version },
      },
    } = await this.checkoutApi.createPaymentLink({
      idempotencyKey: uidv4(),
      order,
      checkoutOptions,
    });

    const redirect = new URL(checkoutOptions.redirectUrl);
    redirect.pathname += `/${orderId}`;
    checkoutOptions.redirectUrl = redirect.toString();

    return await this.checkoutApi.updatePaymentLink(paymentLinkId, {
      paymentLink: {
        version,
        checkoutOptions,
      },
    });
  }

  async processSuccessfulCheckout(id: string) {
    const {
      result: { order },
    } = await this.orderService.getOrder(id);
    if (!order) {
    } //somethings wrong

    return await this.orderService.updateOrder(id, {
      order: {
        locationId: order.locationId,
        version: order.version,
      },
      fieldsToClear: ['line_items'],
    });
  }
}
