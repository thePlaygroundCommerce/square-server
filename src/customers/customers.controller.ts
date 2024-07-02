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
  RetrieveCatalogObjectResponse,
  SearchCatalogObjectsRequest,
  SearchCatalogObjectsResponse,
  CustomersApi,
  SearchCustomersRequest,
  SearchCustomersResponse,
  CreateCustomerRequest,
  CreateCustomerResponse,
} from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Controller('customers')
export class CustomersController {
  customersApi: CustomersApi;
  private readonly logger = new Logger(CustomersController.name);
  private static DEFAULT_CATALOG_ITEM_TYPES = '';

  constructor(SquareClient: SquareClient) {
    this.customersApi = SquareClient.getClient().customersApi;
  }

  @Post('search')
  async searchCustomers(
    @Body() body: SearchCustomersRequest,
  ): Promise<ApiResponse<SearchCustomersResponse>> {
    try {
      const res = await this.customersApi.searchCustomers(body);
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
  @Post('create')
  async createCustomers(
    @Body() body: CreateCustomerRequest,
  ): Promise<ApiResponse<CreateCustomerResponse>> {
    const queryByEmail = {
      filter: {
        emailAddress: {
          exact: body.emailAddress,
        },
      },
    };

    try {
      const searchRes = await this.searchCustomers({
        query: queryByEmail,
      });

      if (searchRes.result.customers?.length > 0) {
        return;
        // TODO document why this block is empty
      }

      const res = await this.customersApi.createCustomer(body);
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
}
