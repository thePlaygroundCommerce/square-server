import { Injectable, Logger } from '@nestjs/common';
import {
  ApiError,
  ApiResponse,
  CatalogApi,
  CatalogItem,
  CatalogItemVariation,
  CatalogObject,
  RetrieveCatalogObjectResponse,
  SearchCatalogItemsRequest,
  SearchCatalogItemsResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Injectable()
export class CatalogApiService {
  catalogApi: CatalogApi;
  private readonly logger = new Logger(CatalogApiService.name);

  constructor(SquareClient: SquareClient) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  async getProduct(id: string): Promise<any> {
    try {
      const {
        result,
        result: { relatedObjects },
      } = await this.catalogApi.retrieveCatalogObject(id, true);
      console.log(
        result,
        relatedObjects.filter(({ type }) => type === 'CATEGORY')[0],
      );
      return {
        result,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('Error Response returned: ', error);
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }
  getProducts(id: string) {}
  async searchProducts(
    body: SearchCatalogItemsRequest,
  ): Promise<SearchProductsResponse> {
    const result = { cursor: '', objects: [] };

    try {
      // retrieve items
      const {
        result: { items = [], cursor },
      } = await this.catalogApi.searchCatalogItems(body);

      if (items.length === 0) return result;

      const imageIdSet = items.reduce((set, { itemData: { imageIds } }) => {
        imageIds.forEach((id) => !set.has(id) && set.add(id));
        return set;
      }, new Set<string>());

      // retrieve item imgs
      const {
        result: { objects: imageObjs },
      } = await this.catalogApi.batchRetrieveCatalogObjects({
        objectIds: Array.from(imageIdSet),
      });

      result.cursor = cursor;
      result.objects = [...imageObjs, ...items];

      return result;
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }
}

type Product = {
  id: CatalogObject['id'];
  name: string;
  description: string;
  taxes: [];
  variations: ProductVariation[];
} & CatalogItem;

type ProductVariation = {
  id: CatalogObject['id'];
} & CatalogItemVariation;

export type SearchProductsResponse = {
  objects: CatalogObject[];
  cursor: SearchCatalogItemsResponse['cursor'];
};
