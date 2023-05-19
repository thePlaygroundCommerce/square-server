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
    @Param('customerId') { customerId }: { customerId: string },
  ) {
    try {
      return this.customersApi.retrieveCustomer(customerId);
    } catch (error) {}
  }

  @Delete(['delete', ':customerId'])
  async deleteCustomer(
    @Param('customerId') { customerId }: { customerId: string },
  ) {
    try {
      return this.customersApi.deleteCustomer(customerId);
    } catch (error) {}
  }

  @Put(['update', ':customerId'])
  async updateCustomer(
    @Body() updatedCustomer: UpdateCustomerRequest,
    @Param('customerId') { customerId }: { customerId: string },
  ) {
    try {
      return this.customersApi.updateCustomer(customerId, updatedCustomer);
    } catch (error) {}
  }

  @Post('create')
  async createCustomer(@Body() newCustomer: CreateCustomerRequest) {
    try {
      return this.customersApi.createCustomer(newCustomer);
    } catch (error) {}
  }
}
