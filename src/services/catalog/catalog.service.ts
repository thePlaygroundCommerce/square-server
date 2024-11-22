import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import Cache from 'cache-manager';
import { CatalogApi, ApiError } from 'square';
import { CatalogController } from 'src/catalog/catalog.controller';
import { SquareClient } from 'src/square-client/square-client';
import { mapArrayToMap } from 'src/util';

@Injectable()
export class CatalogApiService {
  catalogApi: CatalogApi;
  private readonly logger = new Logger(CatalogController.name);

  constructor(SquareClient: SquareClient, @Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.catalogApi = SquareClient.getClient().catalogApi;
  }

  async getProduct(id: string): Promise<any> {
    try {
      const res = await this.catalogApi.retrieveCatalogObject(id, true);
      const {
        result: { object, relatedObjects },
        statusCode,
      } = res;
      console.log(mapArrayToMap([object, ...relatedObjects]));
      console.debug('Response returned: ', statusCode);
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
}
