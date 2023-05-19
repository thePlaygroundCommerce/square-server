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

@Controller('catalog')
export class CatalogController {
  catalogApi: CatalogApi;

  constructor(SquareClient: SquareClient) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  @Get('objects')
  async listCatalogObjects(): Promise<ApiResponse<ListCatalogResponse>> {
    try {
      return await this.catalogApi.listCatalog(undefined, 'IMAGE,ITEM');
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }

  @Get(':slug')
  async retrieveCatalogObject(
    @Param() { slug }: { slug: string },
  ): Promise<ApiResponse<RetrieveCatalogObjectResponse>> {
    console.log(slug);
    try {
      return await this.catalogApi.retrieveCatalogObject(slug);
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }

  @Get()
  async getCatalogObjects(
    @Body()
    { objectIds, includeRelatedObjects }: BatchRetrieveCatalogObjectsRequest,
  ): Promise<ApiResponse<BatchRetrieveCatalogObjectsResponse>> {
    try {
      return await this.catalogApi.batchRetrieveCatalogObjects({
        objectIds,
        includeRelatedObjects,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }
}
