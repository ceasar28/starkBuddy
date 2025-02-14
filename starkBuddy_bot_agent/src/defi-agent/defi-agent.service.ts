import { Injectable } from '@nestjs/common';
import { StarknetAgent } from 'starknet-agent-kit';
import { RpcProvider } from 'starknet';

@Injectable()
export class DefiAgentService {
  private readonly starkAgent: StarknetAgent;
  constructor() {
    this.starkAgent = new StarknetAgent({
      provider: new RpcProvider({ nodeUrl: process.env.RPC_URL }),
      accountPrivateKey: process.env.PRIVATE_KEY,
      accountPublicKey: process.env.PUBLIC_ADDRESS,
      aiProvider: 'openai',
      aiModel: 'gpt-4o-mini',
      aiProviderApiKey: process.env.AI_PROVIDER_API_KEY,
      signature: 'key',
      agentMode: 'agent',
    });
  }

  async swapToken(prompt: string) {
    console.log(prompt);
    try {
      const response: any = await this.starkAgent.execute(
        'what is my wallet address?',
      );
      return response;
    } catch (error) {
      console.log(error);
    }
  }
}
