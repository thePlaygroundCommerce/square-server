import { Body, Controller, Get, Param } from '@nestjs/common';
import {
  ApiResponse,
  ListCatalogResponse,
  ApiError,
  BatchRetrieveCatalogObjectsResponse,
  BatchRetrieveCatalogObjectsRequest,
  CatalogApi,
  RetrieveCatalogObjectResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Controller('categories')
export class CategoriesController {
  catalogApi: CatalogApi;

  constructor(SquareClient: SquareClient) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  @Get('objects')
  async getCategoryObjects(): Promise<ApiResponse<ListCatalogResponse>> {
    try {
      const res = await this.catalogApi.listCatalog(undefined, 'IMAGE,ITEM');
      console.debug('Response returned: ', res);
      return res;
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }
}
