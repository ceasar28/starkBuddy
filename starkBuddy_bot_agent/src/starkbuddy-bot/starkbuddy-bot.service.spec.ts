import { Test, TestingModule } from '@nestjs/testing';
import { StarkbuddyBotService } from './starkbuddy-bot.service';

describe('StarkbuddyBotService', () => {
  let service: StarkbuddyBotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StarkbuddyBotService],
    }).compile();

    service = module.get<StarkbuddyBotService>(StarkbuddyBotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
