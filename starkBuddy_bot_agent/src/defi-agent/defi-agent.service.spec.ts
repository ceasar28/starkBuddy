import { Test, TestingModule } from '@nestjs/testing';
import { DefiAgentService } from './defi-agent.service';

describe('DefiAgentService', () => {
  let service: DefiAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefiAgentService],
    }).compile();

    service = module.get<DefiAgentService>(DefiAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
