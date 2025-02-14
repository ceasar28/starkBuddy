import { Module } from '@nestjs/common';
import { StarkbuddyBotService } from './starkbuddy-bot.service';
import { HttpModule } from '@nestjs/axios';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from 'src/database/schemas/session.schema';
import { DatabaseModule } from 'src/database/database.module';
import { DefiAgentModule } from 'src/defi-agent/defi-agent.module';

@Module({
  imports: [
    DefiAgentModule,
    DatabaseModule,
    HttpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Session.name, schema: SessionSchema }]),
  ],
  providers: [StarkbuddyBotService],
})
export class StarkbuddyBotModule {}
