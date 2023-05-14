import { Test, TestingModule } from '@nestjs/testing';
import { SquareClient } from './square-client';

describe('SquareClient', () => {
  let provider: SquareClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SquareClient],
    }).compile();

    provider = module.get<SquareClient>(SquareClient);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
