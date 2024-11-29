import { Injectable, Logger } from '@nestjs/common';
import {
  ApiError,
  CatalogApi,
  CatalogItem,
  CatalogItemVariation,
  CatalogObject,
  RetrieveCatalogObjectResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Injectable()
export class CatalogApiService {
  catalogApi: CatalogApi;
  private readonly logger = new Logger(CatalogApiService.name);

  constructor(SquareClient: SquareClient) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  async getProduct(id: string): Promise<RetrieveCatalogObjectResponse> {
    try {
       return (await this.catalogApi.retrieveCatalogObject(id, true))
        .result;
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
  searchProducts(id: string) {}
}

type Product = {
  id: CatalogObject['id'];
  name: string;
  description: string;
  taxes: []
  variations: ProductVariation[]
} & CatalogItem;

type ProductVariation = {
  id: CatalogObject['id'];
} & CatalogItemVariation;
