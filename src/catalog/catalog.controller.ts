import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  private static DEFAULT_CATALOG_ITEM_TYPES = "";

  constructor(SquareClient: SquareClient) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  @Get('objects')
  async listCatalogObjects(@Query() query: any): Promise<ApiResponse<ListCatalogResponse>> {
    console.log('Catalog request received!');
    try {
      const res = await this.catalogApi.listCatalog(undefined, query.types);
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

  @Get(':slug')
  async retrieveCatalogObject(
    @Param()
    {
      slug,
    }: {
      slug: string;
    },
  ): Promise<ApiResponse<RetrieveCatalogObjectResponse>> {
    console.log('Catalog request received!', slug);
    try {
      const res = await this.catalogApi.retrieveCatalogObject(slug, true);
      console.debug('Response returned: ', res);
      return res;
    } catch (error) {
      if (error instanceof ApiError) {
        console.log('Error Response returned: ', error);
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }

  @Post()
  async getCatalogObjects(
    @Body()
    { objectIds, includeRelatedObjects }: BatchRetrieveCatalogObjectsRequest,
  ): Promise<ApiResponse<BatchRetrieveCatalogObjectsResponse>> {
    console.log('Catalog request received!');
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
