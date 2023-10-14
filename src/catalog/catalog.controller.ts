import { Body, Controller, Get, Logger, Param, Post, Query } from '@nestjs/common';
import {
  ApiResponse,
  ListCatalogResponse,
  ApiError,
  BatchRetrieveCatalogObjectsResponse,
  BatchRetrieveCatalogObjectsRequest,
  CatalogApi,
  RetrieveCatalogObjectResponse,
  SearchCatalogItemsResponse,
  SearchCatalogItemsRequest,
  SearchCatalogObjectsRequest,
  SearchCatalogObjectsResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Controller('catalog')
export class CatalogController {
  catalogApi: CatalogApi;
  private readonly logger = new Logger(CatalogController.name);

  private static DEFAULT_CATALOG_ITEM_TYPES = "";

  constructor(SquareClient: SquareClient) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  @Post('search')
  async searchCatalogItems(@Body() body: SearchCatalogObjectsRequest): Promise<ApiResponse<SearchCatalogObjectsResponse>> {
    try {
      const res = await this.catalogApi.searchCatalogObjects(body);
      console.debug('Response returned: ', res.statusCode);
      console.log(res.result)
      return res;
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }

  @Get('objects')
  async listCatalogObjects(@Query() query: any): Promise<ApiResponse<ListCatalogResponse>> {
    try {
      this.logger.debug(query);
      const res = await this.catalogApi.listCatalog(undefined, query.types);
      this.logger.debug('Response returned: ', res.statusCode);
      return res;
    } catch (error) {
      if (error instanceof ApiError) {
        this.logger.log(error);
        return error.result;
      } else {
        this.logger.log('Unexpected error occurred: ', error);
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
