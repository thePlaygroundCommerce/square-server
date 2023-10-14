import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateCustomerRequest, CustomersApi, UpdateCustomerRequest } from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Controller('customer')
export class CustomerController {
  customersApi: CustomersApi;

  constructor(SquareClient: SquareClient) {
    this.customersApi = SquareClient.getClient().customersApi;
  }

  @Get(':customerId')
  async getCustomer(
    @Param('customerId') customerId: string,
  ) {
    try {
      return await this.customersApi.retrieveCustomer(customerId);
    } catch (error) {
      console.log(error)
      return error.result;
    }
  }

  @Delete(['delete', ':customerId'])
  async deleteCustomer(
    @Param('customerId') { customerId }: { customerId: string },
  ) {
    try {
      return await this.customersApi.deleteCustomer(customerId);
    } catch (error) {
      console.log(error)
      return error.result;
    }
  }

  @Put(['update', ':customerId'])
  async updateCustomer(
    @Body() updatedCustomer: UpdateCustomerRequest,
    @Param('customerId') { customerId }: { customerId: string },
  ) {
    try {
      return await this.customersApi.updateCustomer(customerId, updatedCustomer);
    } catch (error) {
      console.log(error)
      return error.result;
    }
  }

  @Post('create')
  async createCustomer(@Body() newCustomer: CreateCustomerRequest) {
    try {
      return await this.customersApi.createCustomer(newCustomer);
    } catch (error) {
      console.log(error)
      return error.result;
    }
  }
}
