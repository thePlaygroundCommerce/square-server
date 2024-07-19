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
  UpdatePaymentLinkResponse,
} from 'square';
import { ApiErrorFilter } from 'src/order-api/order-api.service';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post('item')
  @UseFilters(ApiErrorFilter)
  async getCheckoutItemUrl(
    @Body() lineItems: any,
    @Query() { redirect }: any,
  ): Promise<ApiResponse<UpdatePaymentLinkResponse>> {
    const checkoutOptions: CheckoutOptions = {
      redirectUrl: redirect,
    };
    return this.checkoutService.processItemCheckout({
      order: {
        locationId: process.env.SQUARE_MAIN_LOCATION_ID,
        lineItems: lineItems,
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
      redirectUrl: redirectUrl.toString(),
    };

    return this.checkoutService.processOrderCheckout(id, checkoutOptions);
  }

  @Get('process/:id')
  @UseFilters(ApiErrorFilter)
  async postSuccessfulCheckout(
    @Res() res: Response,
    @Query() { redirect, cartId }: any,
  ): Promise<void> {
    await this.checkoutService.processSuccessfulCheckout(cartId);

    res.redirect(redirect);
  }
}
