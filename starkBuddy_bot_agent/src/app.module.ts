import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StarkbuddyBotModule } from './starkbuddy-bot/starkbuddy-bot.module';
import { DatabaseModule } from './database/database.module';
import { DefiAgentModule } from './defi-agent/defi-agent.module';

@Module({
  imports: [StarkbuddyBotModule, DatabaseModule, DefiAgentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
