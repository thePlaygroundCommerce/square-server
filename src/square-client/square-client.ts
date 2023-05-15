import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Environment } from 'square';

@Injectable()
export class SquareClient {
    squareClient: Client;
  
    constructor(configService: ConfigService) {
      console.log(process.env.SQUARE_ACCESS_TOKEN)
      this.squareClient = new Client({
        accessToken: process.env.SQUARE_ACCESS_TOKEN || configService.get<string>('SQUARE_ACCESS_TOKEN'),
        environment: process.env.NODE_ENV ? Environment.Production : Environment.Sandbox
      });
    }
  
    getClient = () => this.squareClient;
  }
