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

  private static DEFAULT_CATALOG_ITEM_TYPES = '';

  constructor(SquareClient: SquareClient) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  @Post('search')
  async searchCatalogItems(
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
    { slug }: { slug: string },
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
  ): Promise<any> {
    try {
      const batchRes = await this.catalogApi.batchRetrieveCatalogObjects({
        objectIds,
        includeRelatedObjects,
      });

      const result = batchRes.result;

      if (
        result.relatedObjects.filter((item) => item.type === 'IMAGE').length > 0
      )
        return batchRes;
      else {
        const catalogLinkMap = result.relatedObjects
          .filter((item) => item.type === 'ITEM')
          .reduce(
            (acc, item) => ({
              ...acc,
              [item.id]: [
                objectIds.filter((id) =>
                  item.itemData.variations.map(({ id }) => id).includes(id),
                ),
                item.itemData.imageIds ?? [],
              ],
            }),
            {},
          );
        const catalogImages = await this.catalogApi.batchRetrieveCatalogObjects(
          {
            objectIds: Array.from(
              new Set(
                result.relatedObjects
                  .filter((item) => item.type === 'ITEM')
                  .map((item) => item.itemData.imageIds ?? [])
                  .flat(),
              ),
            ),
          },
        );

        const variationToImageMap = catalogImages.result.objects.reduce(
          (acc, image) => ({
            ...acc,
            [Object.values(catalogLinkMap).find(([_, arr2]) =>
              arr2.includes(image.id),
            )[0]]: image.imageData,
          }),
          {},
        );

        return variationToImageMap;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        return error.result;
      } else {
        console.log('Unexpected error occurred: ', error);
      }
    }
  }
}
