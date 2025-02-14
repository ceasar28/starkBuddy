import { Module } from '@nestjs/common';
import { DefiAgentService } from './defi-agent.service';

@Module({
  providers: [DefiAgentService],
  exports: [DefiAgentService],
})
export class DefiAgentModule {}
