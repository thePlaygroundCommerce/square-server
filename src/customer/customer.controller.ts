import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
} from '@nestjs/common';
import {
  ApiError,
  ApiResponse,
  CreateCustomerRequest,
  CreateCustomerResponse,
  CustomersApi,
  SearchCustomersRequest,
  SearchCustomersResponse,
  UpdateCustomerRequest,
} from 'square';
import { ApiErrorFilter } from 'src/order-api/order-api.service';
import { SquareClient } from 'src/square-client/square-client';

@Controller('customers')
@UseFilters(ApiErrorFilter)
export class CustomerController {
  customersApi: CustomersApi;

  constructor(SquareClient: SquareClient) {
    this.customersApi = SquareClient.getClient().customersApi;
  }

  @Get(':customerId')
  async getCustomer(@Param('customerId') customerId: string) {
    return await this.customersApi.retrieveCustomer(customerId);
  }

  @Delete(['delete', ':customerId'])
  async deleteCustomer(
    @Param('customerId') { customerId }: { customerId: string },
  ) {
    try {
      return await this.customersApi.deleteCustomer(customerId);
    } catch (error) {
      console.log(error);
      return error.result;
    }
  }

  @Put(['update', ':customerId'])
  async updateCustomer(
    @Body() updatedCustomer: UpdateCustomerRequest,
    @Param('customerId') { customerId }: { customerId: string },
  ) {
    try {
      return await this.customersApi.updateCustomer(
        customerId,
        updatedCustomer,
      );
    } catch (error) {
      console.log(error);
      return error.result;
    }
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
  async createCustomer(@Body() newCustomer: CreateCustomerRequest) {
    return await this.customersApi.createCustomer(newCustomer);
  }

  @Post('register')
  async registerCustomer(
    @Body()
    {
      emailAddress,
      phoneNumber,
    }: {
      emailAddress: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
    },
  ) {
    let opResult: CreateCustomerResponse = {
      errors: [],
    };

    const {
      result: { customers, ...rest },
    } = await this.customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: { exact: emailAddress },
          phoneNumber: { exact: phoneNumber },
        },
      },
    });

    if (!customers) {
      const { result } = await this.customersApi.createCustomer({
        emailAddress,
        phoneNumber,
      });

      opResult = result;
    } else {
      opResult = {
        customer: customers[0],
        ...rest,
      };
    }

    return opResult;
  }
}
