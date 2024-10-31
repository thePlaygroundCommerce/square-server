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
  CalculateOrderRequest,
  CatalogApi,
  CatalogImage,
  CatalogObject,
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
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
import { addAbortSignal } from 'stream';

@Controller('carts')
@UseFilters(ApiErrorFilter)
export class CartsController {
  catalogApi: CatalogApi;
  constructor(
    private orderService: OrderApiService,
    private SquareClient: SquareClient,
  ) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  @Post('create')
  async createCart(
    @Body() req: CreateOrderRequest,
  ): Promise<ApiResponse<CreateOrderResponse>> {
    return await this.orderService.createOrder(req);
  }

  @Post('calculate')
  async calculateCart(
    @Body()
    req: CalculateOrderRequest,
  ): Promise<ApiResponse<UpdateOrderResponse>> {
    return await this.orderService.calculatetOrder(req);
  }

  @Put('update/:orderId')
  async updateCart(
    @Body()
    req: {
      order: Order;
      fieldsToClear: string[];
    },
    @Param('orderId') orderId: string,
  ): Promise<ApiResponse<UpdateOrderResponse>> {
    return await this.orderService.updateOrder(orderId, req);
  }

  @Get(':orderId')
  async getCart(
    @Param('orderId') orderId,
  ): Promise<ApiResponse<RetrieveOrderResponse>['result']> {
    const result: {
      imageMap?: { [id: string]: CatalogImage };
      relatedObjects?: CatalogObject[];
      order?: Order;
    } = {};
    const { order, errors } = (await this.orderService.getOrder(orderId))
      .result;

    result.order = order;

    const objIds = order.lineItems.map(
      ({ catalogObjectId }) => catalogObjectId,
    );

    const { relatedObjects } = (
      await this.catalogApi.batchRetrieveCatalogObjects({
        objectIds: objIds,
        includeRelatedObjects: true,
      })
    ).result;

    result.relatedObjects = relatedObjects;

    type Simplify<T> = { [id: string]: T };

    // links item obj to obj
    const catalogLinkMap: Simplify<{ variationIds: any[]; imageIds: any[] }> =
      relatedObjects
        ?.filter((item) => item.type === 'ITEM')
        .reduce((acc, item) => {
          return {
            ...acc,
            [item.id]: {
              variationIds: objIds.filter((id) =>
                item.itemData.variations.map(({ id }) => id).includes(id),
              ),
              imageIds: item.itemData.imageIds ?? [],
            },
          };
        }, {});

    const imageIds = Array.from(
      new Set(
        relatedObjects
          ?.filter((item) => item.type === 'ITEM')
          .map((item) => item.itemData.imageIds ?? [])
          .flat(),
      ),
    );

    if (imageIds.length === 0) return result;

    const catalogImages = (
      await this.catalogApi.batchRetrieveCatalogObjects({
        objectIds: imageIds,
      })
    ).result.objects;

    const variationToImageMap: { [id: string]: CatalogImage } = Object.values(
      catalogLinkMap,
    ).reduce((acc: {}, { variationIds: [id], imageIds: [imageId] }) => {
      return {
        ...acc,
        [id]: catalogImages.find(({ id }) => id === imageId).imageData,
      };
    }, {});

    result.imageMap = variationToImageMap;

    return result;
  }
}
