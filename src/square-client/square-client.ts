import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Environment } from 'square';

@Injectable()
export class SquareClient {
    squareClient: Client;
  
    constructor(configService: ConfigService) {
      this.squareClient = new Client({
        accessToken: configService.get<string>('SQUARE_ACCESS_TOKEN'),
        environment: Environment.Sandbox,
      });
    }
  
    getClient = () => this.squareClient;
  }
