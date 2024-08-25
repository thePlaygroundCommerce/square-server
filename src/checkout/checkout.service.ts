import { Injectable, Logger } from '@nestjs/common';
import {
  CheckoutApi,
  CheckoutOptions,
  CreatePaymentLinkRequest,
  CustomersApi,
  OrdersApi,
} from 'square';
import { v4 as uidv4 } from 'uuid';
import { OrderApiService } from 'src/order-api/order-api.service';
import { SquareClient } from 'src/square-client/square-client';
import { PRICING_OPTIONS, SERVICE_CHARGES } from './checkout.controller';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);
  private checkoutApi: CheckoutApi;
  private customerApi: CustomersApi;

  constructor(
    SquareClient: SquareClient,
    private orderService: OrderApiService,
  ) {
    this.checkoutApi = SquareClient.getClient().checkoutApi;
    this.customerApi = SquareClient.getClient().customersApi;
  }

  async processOrderCheckout(id: string, options: CheckoutOptions) {
    const {
      result: { order },
    } = await this.orderService.getOrder(id);

    const shippingCharges =
      order.serviceCharges?.filter((charge) => charge.name === 'shipping') ??
      [];
    if (shippingCharges.length === 0)
      order.serviceCharges = shippingCharges
        .concat(order.serviceCharges, SERVICE_CHARGES)
        .filter((charge) => charge);

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
        serviceCharges: order.serviceCharges,
        pricingOptions: PRICING_OPTIONS,
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

  // TODO: Do we reaally want to delete line items? Or should we change state of order to signal client to use new cart id?
  async processSuccessfulCheckout(id: string) {
    const {
      result: { order },
    } = await this.orderService.getOrder(id);

    return await this.orderService.updateOrder(id, {
      order: {
        locationId: order.locationId,
        version: order.version,
      },
      fieldsToClear: ['line_items'],
    });
  }
}
