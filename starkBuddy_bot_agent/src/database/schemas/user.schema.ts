import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type UserDocument = mongoose.HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ unique: true })
  chatId: number;

  @Prop()
  userName: string;

  @Prop()
  walletAddress: string;

  @Prop()
  walletDetails: string;

  @Prop()
  linkCode: string;

  @Prop({ default: 0 })
  upperThreshold: string;

  @Prop({ default: 0 })
  lowerThreshold: string;

  @Prop({ default: 0 })
  usdcAllocation: string;

  @Prop({ default: 0 })
  modeAllocation: string;

  @Prop({ default: false })
  rebalanceEnabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
