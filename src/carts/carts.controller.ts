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
  async createCart(@Body() req: CreateOrderRequest): Promise<CartOpResponse> {
    const { order, errors } = (await this.orderService.createOrder(req)).result;
    const data = await this.getLineItemCatalogData(order.lineItems ?? []);
    return {
      order,
      ...data,
    };
  }

  @Post('calculate')
  async calculateCart(
    @Body()
    req: CalculateOrderRequest,
  ): Promise<CartOpResponse> {
    const { order, errors } = (await this.orderService.calculatetOrder(req))
      .result;
    const data = await this.getLineItemCatalogData(order.lineItems ?? []);
    return {
      order,
      ...data,
    };
  }

  @Put('update/:orderId')
  async updateCart(
    @Body()
    req: {
      order: Order;
      fieldsToClear: string[];
    },
    @Param('orderId') orderId: string,
  ): Promise<CartOpResponse> {
    const { order } = (await this.orderService.updateOrder(orderId, req))
      .result;

    const data = await this.getLineItemCatalogData(order.lineItems ?? []);
    return {
      order,
      ...data,
    };
  }

  @Get(':orderId')
  async getCart(@Param('orderId') orderId: string): Promise<CartOpResponse> {
    const result: {
      imageMap?: { [id: string]: CatalogImage };
      relatedObjects?: CatalogObject[];
      options?: Simplify<Simplify<CatalogObject[]>>;
      order?: Order;
    } = {};
    const { order, errors } = (await this.orderService.getOrder(orderId))
      .result;

    const { variationToImageMap, options, relatedObjects } =
      await this.getLineItemCatalogData(order.lineItems ?? []);

    result.order = order;
    result.relatedObjects = relatedObjects;
    result.imageMap = variationToImageMap;
    result.options = options;

    return result;
  }

  async getLineItemCatalogData(lineItems: OrderLineItem[]) {
    if(lineItems.length == 0) return {}
    const objIds = lineItems.map(({ catalogObjectId }) => catalogObjectId);
    const { objects: itemVariationObjs, relatedObjects } = (
      await this.catalogApi.batchRetrieveCatalogObjects({
        objectIds: objIds,
        includeRelatedObjects: true,
      })
    ).result;

    const variationToOptionTree = itemVariationObjs.reduce<{
      [id: string]: {
        [id: string]: (string | CatalogObject)[];
      };
    }>((acc, { id, itemVariationData: { itemOptionValues } }) => {
      acc[id] = {};
      if (!itemOptionValues) return acc;
      itemOptionValues.forEach(({ itemOptionId, itemOptionValueId }) => {
        if (!acc[id][itemOptionId]) acc[id][itemOptionId] = [itemOptionValueId];
        else acc[id][itemOptionId].push(itemOptionValueId);
      });

      return acc;
    }, {});

    // links item obj to obj
    const itemToVariationAndImageMap: Simplify<{
      variationIds: any[];
      imageIds: any[];
    }> = relatedObjects
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

    const catalogObjs = (
      await this.catalogApi.batchRetrieveCatalogObjects({
        objectIds: [
          ...imageIds,
          ...(Object.values(variationToOptionTree)
            .map((obj) => Object.values(obj).flat())
            .flat() as string[]),
        ],
      })
    ).result.objects
    
    const optValueObjs = catalogObjs.filter(({ type }) => type === 'ITEM_OPTION_VAL');
    const imgObjs = catalogObjs.filter(({ type }) => type === 'IMAGE');

    const options = Object.fromEntries(
      Object.entries(variationToOptionTree).map(([itemId, obj]) => {
        return [
          itemId,
          Object.fromEntries(
            Object.entries(obj).map(([id, arr]) => {
              const newArr = arr.map((id) =>
                optValueObjs.find(({ id: objId }) => id === objId),
              );
              return [id, newArr];
            }),
          ),
        ];
      }),
    );

    const variationToImageMap: { [id: string]: CatalogImage } = Object.values(
      itemToVariationAndImageMap,
    ).reduce((acc: {}, { variationIds: [id], imageIds: [imageId] }) => {
      return {
        ...acc,
        [id]: imgObjs.find(({ id }) => id === imageId)?.imageData,
      };
    }, {});
    return {
      options,
      relatedObjects,
      variationToImageMap,
    };
  }
}

export type Simplify<T> = { [id: string]: T };

type CartOpResponse = {
  imageMap?: { [id: string]: CatalogImage };
  relatedObjects?: CatalogObject[];
  options?: Simplify<Simplify<CatalogObject[]>>;
  order?: Order;
};
