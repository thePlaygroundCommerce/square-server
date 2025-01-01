import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiResponse,
  CheckoutOptions,
  CreatePaymentLinkResponse,
  OrderLineItem,
  OrderPricingOptions,
  UpdatePaymentLinkResponse,
} from 'square';
import {
  ApiErrorFilter,
  OrderApiService,
} from 'src/order-api/order-api.service';
import { CheckoutService } from './checkout.service';

export const SERVICE_CHARGES = [
  {
    name: 'FREE SHIPPING',
    amountMoney: {
      amount: BigInt(0),
      currency: 'USD',
    },
    calculationPhase: 'TOTAL_PHASE',
  },
];

export const PRICING_OPTIONS: OrderPricingOptions = {
  autoApplyDiscounts: true,
  autoApplyTaxes: true,
};

@Controller('checkout')
export class CheckoutController {
  constructor(
    private checkoutService: CheckoutService,
    private orderService: OrderApiService,
  ) {}

  @Post('item')
  @UseFilters(ApiErrorFilter)
  async getCheckoutItemUrl(
    @Body() lineItems: any,
    @Query() { redirect }: any,
  ): Promise<ApiResponse<UpdatePaymentLinkResponse>> {
    const checkoutOptions: CheckoutOptions = {
      askForShippingAddress: true,
      redirectUrl: redirect,
    };
    return this.checkoutService.processItemCheckout({
      order: {
        locationId: process.env.SQUARE_MAIN_LOCATION_ID,
        lineItems: lineItems,
        serviceCharges: SERVICE_CHARGES,
        pricingOptions: PRICING_OPTIONS,
      },
      checkoutOptions,
    });
  }

  @Get('order/:id')
  @UseFilters(ApiErrorFilter)
  async getCheckoutOrderUrl(
    @Req() req: Request,
    @Param() { id }: { id: string },
    @Query() { redirect }: any,
  ): Promise<ApiResponse<CreatePaymentLinkResponse>> {
    const redirectUrl = new URL(
      `${req.protocol}://${req.get(
        'Host',
      )}/checkout/process?cartId=${id}&redirect=${redirect}`,
    );

    const checkoutOptions: CheckoutOptions = {
      askForShippingAddress: true,
      redirectUrl: redirectUrl.toString(),
    };

    return this.checkoutService.processOrderCheckout(id, checkoutOptions);
  }

  @Get('process/:id')
  @UseFilters(ApiErrorFilter)
  async postSuccessfulCheckout(
    @Res() res: Response,
    @Param() { id } : { id: string},
    @Query() { redirect }: any,
  ): Promise<void> {
    await this.checkoutService.processSuccessfulCheckout(id);

    res.redirect(redirect);
  }
}
