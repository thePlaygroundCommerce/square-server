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
  CatalogObject,
} from 'square';
import { Simplify } from 'src/carts/carts.controller';
import {
  CatalogApiService,
  SearchProductsResponse,
} from 'src/catalog-api/catalog-api.service';
import { SquareClient } from 'src/square-client/square-client';
import { addAbortSignal } from 'stream';

@Controller('catalog')
export class CatalogController {
  catalogApi: CatalogApi;

  private readonly logger = new Logger(CatalogController.name);

  constructor(
    SquareClient: SquareClient,
    private catalogService: CatalogApiService,
  ) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  @Post('search')
  async searchCatalogItems(
    @Body() body: SearchCatalogItemsRequest,
  ): Promise<SearchProductsResponse> {
    try {
      const res = await this.catalogService.searchProducts(body);
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
  async getCatalogInformation(): Promise<{
    categoryNameMap: { [id: string]: string };
    objects: { [type: string]: CatalogObject[] };
  }> {
    const catalogList = (
      await this.catalogApi.listCatalog(
        undefined,
        'CATEGORY,TAX,DISCOUNT,ITEM_OPTION',
      )
    ).result.objects;

    const objects = catalogList.reduce<Simplify<CatalogObject[]>>(
      (acc, obj) => ({
        ...acc,
        [obj.type]: acc[obj.type] ? [...acc[obj.type], obj] : [obj],
      }),
      {},
    );

    const categoryNameMap = objects.CATEGORY?.reduce(
      (acc, { id, categoryData: { name } }) => ({ ...acc, [name]: id }),
      {},
    );

    return {
      objects,
      categoryNameMap,
    };
  }

  @Get(':slug')
  async retrieveCatalogObject(
    @Param()
    { slug }: { slug: string },
  ): Promise<any> {
    try {
      const product = await this.catalogService.getProduct(slug);
      return product;
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
