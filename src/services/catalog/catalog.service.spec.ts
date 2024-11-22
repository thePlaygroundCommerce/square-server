import { Test, TestingModule } from '@nestjs/testing';
import { CatalogApiService } from './catalog.service';

describe('CatalogApiService', () => {
  let service: CatalogApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CatalogApiService],
    }).compile();

    service = module.get<CatalogApiService>(CatalogApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
