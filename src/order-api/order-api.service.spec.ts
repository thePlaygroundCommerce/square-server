import { Test, TestingModule } from '@nestjs/testing';
import { OrderApiService } from './order-api.service';

describe('OrderApiService', () => {
  let service: OrderApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderApiService],
    }).compile();

    service = module.get<OrderApiService>(OrderApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
