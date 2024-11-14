import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiResponse,
  ListCatalogResponse,
  ApiError,
  BatchRetrieveCatalogObjectsRequest,
  CatalogApi,
  RetrieveCatalogObjectResponse,
  SearchCatalogObjectsRequest,
  SearchCatalogObjectsResponse,
  SearchCatalogItemsRequest,
  SearchCatalogItemsResponse,
  BatchRetrieveCatalogObjectsResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Controller('catalog')
export class CatalogController {
  catalogApi: CatalogApi;
  private readonly logger = new Logger(CatalogController.name);

  constructor(SquareClient: SquareClient) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  @Post('search')
  async searchCatalogItems(
    @Body() body: SearchCatalogItemsRequest,
  ): Promise<ApiResponse<SearchCatalogItemsResponse>> {
    try {
      const res = await this.catalogApi.searchCatalogItems(body);
      console.debug('Response returned: ', res.statusCode);
      return res;
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }

  @Post('search/objects')
  async searchCatalogObjects(
    @Body() body: SearchCatalogObjectsRequest,
  ): Promise<ApiResponse<SearchCatalogObjectsResponse>> {
    try {
      const res = await this.catalogApi.searchCatalogObjects(body);
      console.debug('Response returned: ', res.statusCode);
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
  async listCatalogObjects(
    @Query() query: any,
  ): Promise<ApiResponse<ListCatalogResponse>> {
    try {
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

  @Get('info')
  async getCatalogInformation() {
    const catalogList = (
      await this.catalogApi.listCatalog(undefined, 'CATEGORY,TAX,DISCOUNT,ITEM_OPTION')
    ).result.objects;

    return catalogList.reduce(
      (acc, obj) => ({
        ...acc,
        [obj.type]: acc[obj.type] ? [...acc[obj.type], obj] : [obj],
      }),
      {},
    );
  }

  @Get(':slug')
  async retrieveCatalogObject(
    @Param()
    { slug }: { slug: string },
  ): Promise<ApiResponse<RetrieveCatalogObjectResponse>> {
    try {
      const res = await this.catalogApi.retrieveCatalogObject(slug, true);
      console.debug('Response returned: ', res.statusCode);
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
  async getProducts(
    @Body()
    { objectIds, includeRelatedObjects }: BatchRetrieveCatalogObjectsRequest,
  ): Promise<BatchRetrieveCatalogObjectsResponse> {
    const result = {};
    let catalogImages = [];
    try {
      return (
        await this.catalogApi.batchRetrieveCatalogObjects({
          objectIds,
          includeRelatedObjects,
        })
      ).result;

      // const result = [...objects, ...relatedObjects].reduce(
      //   (acc, obj) => ({
      //     ...acc,
      //     [obj.type]: acc[obj.type] ? [...acc[obj.type], obj] : [obj],
      //   }),
      //   {},
      // );
      // return result;

      
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }
}
