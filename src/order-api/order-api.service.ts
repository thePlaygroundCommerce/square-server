import { Injectable } from '@nestjs/common';
import { OrdersApi } from 'square';
import { SquareClient } from 'src/square-client/square-client';

@Injectable()
export class OrderApiService {
  ordersApi: OrdersApi;

  constructor(SquareClient: SquareClient) {
    this.ordersApi = SquareClient.getClient().ordersApi;
  }


  
}
