import { Injectable, Logger } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { HttpService } from '@nestjs/axios';
import {
  allFeaturesMarkup,
  displayPrivateKeyMarkup,
  exportWalletWarningMarkup,
  linkToAppMarkup,
  resetWalletWarningMarkup,
  showBalanceMarkup,
  showPortfolioMarkup,
  wallerDetailsMarkup,
  walletFeaturesMarkup,
  welcomeMessageMarkup,
} from './markups';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { Session, SessionDocument } from 'src/database/schemas/session.schema';
import { DefiAgentService } from 'src/defi-agent/defi-agent.service';

const token = process.env.TELEGRAM_TOKEN;

@Injectable()
export class StarkbuddyBotService {
  private readonly starkBuddyBot: TelegramBot;
  private logger = new Logger(StarkbuddyBotService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly defiAgentService: DefiAgentService,
    @InjectModel(User.name) private readonly UserModel: Model<User>,
    @InjectModel(Session.name) private readonly SessionModel: Model<Session>,
  ) {
    this.starkBuddyBot = new TelegramBot(token, { polling: true });
    this.starkBuddyBot.on('message', this.handleRecievedMessages);
    this.starkBuddyBot.on('callback_query', this.handleButtonCommands);
  }

  handleRecievedMessages = async (msg: any) => {
    this.logger.debug(msg);
    try {
      await this.starkBuddyBot.sendChatAction(msg.chat.id, 'typing');

      const [user, session] = await Promise.all([
        this.UserModel.findOne({ chatId: msg.chat.id }),
        this.SessionModel.findOne({ chatId: msg.chat.id }),
      ]);

      // Handle text inputs if not a command
      if (msg.text !== '/start' && msg.text !== '/menu' && session) {
        return this.handleUserTextInputs(msg, session!);
      } else if (msg.text !== '/start' && msg.text !== '/menu' && !session) {
        return this.handleAgentprompts(user, msg.text.trim());
      }
      const command = msg.text!;
      console.log('Command :', command);

      if (command === '/start') {
        console.log('User   ', user);
        const username = msg.from.username;
        if (!user) {
          let uniquecode: string;
          let codeExist: any;
          //loop through to make sure the code does not alread exist
          do {
            uniquecode = await this.generateUniqueAlphanumeric();
            codeExist = await this.UserModel.findOne({
              linkCode: uniquecode,
            });
          } while (codeExist);
          await this.UserModel.create({
            chatId: msg.chat.id,
            userName: username,
            linkCode: uniquecode,
          });
        }

        const welcome = await welcomeMessageMarkup(username);
        if (welcome) {
          const replyMarkup = { inline_keyboard: welcome.keyboard };
          await this.starkBuddyBot.sendMessage(msg.chat.id, welcome.message, {
            reply_markup: replyMarkup,
            parse_mode: 'HTML',
          });
        }
        return;
      }

      // Handle /menu command
      if (command === '/menu') {
        const allFeatures = await allFeaturesMarkup();
        if (allFeatures) {
          const replyMarkup = { inline_keyboard: allFeatures.keyboard };
          await this.starkBuddyBot.sendMessage(
            msg.chat.id,
            allFeatures.message,
            {
              parse_mode: 'HTML',
              reply_markup: replyMarkup,
            },
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  //handler for users inputs
  handleUserTextInputs = async (
    msg: TelegramBot.Message,
    session?: SessionDocument,
    // user?: UserDocument,
  ) => {
    await this.starkBuddyBot.sendChatAction(msg.chat.id, 'typing');
    try {
      //   if (session.tokenInsight) {
      //     // const tokenInsight = await this.rebalancrAgentService.analyzeToken(
      //     //   msg.text.trim(),
      //     // );
      //     if (tokenInsight.insight) {
      //       await this.starkBuddyBot.sendMessage(
      //         msg.chat.id,
      //         `${tokenInsight.insight}`,
      //         { parse_mode: 'Markdown' },
      //       );
      //       await this.SessionModel.deleteMany({ chatId: msg.chat.id });
      //       return;
      //     }
      //   }

      if (session.allocationSetting) {
        const Allocation = await this.validateAllocations(
          msg.text!.trim(),
          msg.chat.id,
        );

        console.log(Allocation);
        if (Allocation.allocation1 && Allocation.allocation2) {
          await this.UserModel.updateOne(
            { chatId: msg.chat.id },
            {
              usdcAllocation: Allocation.allocation1,
              modeAllocation: Allocation.allocation2,
            },
          );
        }
        await this.SessionModel.deleteMany({ chatId: msg.chat.id });
        await this.starkBuddyBot.sendMessage(
          msg.chat.id,
          `Allocation succesfully set\n- USDC :${Allocation.allocation1}%\n- MODE : ${Allocation.allocation2} %`,
        );
      }

      if (session.thresholdSetting) {
        const threshold = await this.validateThresholds(
          msg.text!.trim(),
          msg.chat.id,
        );
        if (threshold.upperThreshold && threshold.lowerThreshold) {
          await this.UserModel.updateOne(
            { chatId: msg.chat.id },
            {
              upperThreshold: threshold.upperThreshold,
              lowerThreshold: threshold.lowerThreshold,
            },
          );
        }
        await this.SessionModel.deleteMany({ chatId: msg.chat.id });
        await this.starkBuddyBot.sendMessage(
          msg.chat.id,
          `Threshold succesfully set\n- Upper :${threshold.upperThreshold}%\n- Lower : ${threshold.lowerThreshold} %`,
        );
      }

      if (session) {
        // update users answerId
        await this.SessionModel.updateOne(
          { _id: session._id },
          { $push: { userInputId: msg.message_id } },
        );
      }

      // parse incoming message and handle commands
      try {
        //handle import wallet private key
        if (
          session &&
          session.importWallet &&
          session.importWalletPromptInput
        ) {
          await this.starkBuddyBot.sendChatAction(msg.chat.id, 'typing');
          //   if (await this.isPrivateKey(msg.text!.trim(), msg.chat.id)) {
          //     const privateKey = msg.text!.trim();
          //     console.log(privateKey);
          //     const importedWallet = this.walletService.getAddressFromPrivateKey(
          //       `${privateKey}`,
          //     );
          //     console.log(importedWallet);

          //     // encrypt wallet details with  default
          //     const encryptedWalletDetails =
          //       await this.walletService.encryptWallet(
          //         process.env.DEFAULT_WALLET_PIN!,
          //         privateKey,
          //       );

          //     // save  user wallet details
          //     await this.UserModel.updateOne(
          //       { chatId: msg.chat.id },
          //       {
          //         defaultWalletDetails: encryptedWalletDetails.json,
          //         walletAddress: importedWallet.address,
          //       },
          //     );

          //     const promises: any[] = [];
          //     const latestSession = await this.SessionModel.findOne({
          //       chatId: msg.chat.id,
          //     });
          //     // loop through  import privateKey prompt to delete them
          //     for (
          //       let i = 0;
          //       i < latestSession!.importWalletPromptInputId.length;
          //       i++
          //     ) {
          //       promises.push(
          //         await this.starkBuddyBot.deleteMessage(
          //           msg.chat.id,
          //           latestSession!.importWalletPromptInputId[i],
          //         ),
          //       );
          //     }
          //     // loop through to delete all userReply
          //     for (let i = 0; i < latestSession!.userInputId.length; i++) {
          //       promises.push(
          //         await this.starkBuddyBot.deleteMessage(
          //           msg.chat.id,
          //           latestSession!.userInputId[i],
          //         ),
          //       );
          //     }

          //     await this.sendWalletDetails(msg.chat.id, importedWallet.address);
          //   }
          return;
        }
      } catch (error) {
        console.error(error);

        return await this.starkBuddyBot.sendMessage(
          msg.chat.id,
          `Processing command failed, please try again`,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  //handler for users inputs
  handleAgentprompts = async (user: UserDocument, msg: string) => {
    console.log('here');
    await this.starkBuddyBot.sendChatAction(user.chatId, 'typing');
    try {
      const response = await this.defiAgentService.swapToken(msg);
      if (response) {
        return await this.starkBuddyBot.sendMessage(user.chatId, response, {
          parse_mode: 'Markdown',
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  //   promptAgentToRebalance = async (user: UserDocument, msg: string) => {
  //     console.log('rebalancing');
  //     await this.starkBuddyBot.sendChatAction(user.chatId, 'typing');
  //     try {
  //       const encryptedWallet = await this.walletService.decryptWallet(
  //         `${process.env.DEFAULT_WALLET_PIN}`,
  //         user.walletDetails,
  //       );
  //       console.log(encryptedWallet);
  //       if (encryptedWallet.privateKey) {
  //         const response = await this.rebalancrAgentService.swapToken(
  //           encryptedWallet.privateKey,
  //           msg,
  //         );
  //         if (response) {
  //           return await this.starkBuddyBot.sendMessage(
  //             user.chatId,
  //             `🔔Rebalance Alert🔔\n\n${response}`,
  //             {
  //               parse_mode: 'Markdown',
  //             },
  //           );
  //         }
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  handleButtonCommands = async (query: any) => {
    this.logger.debug(query);
    let command: string;
    // let markdownId: string;

    // const last_name = query.from.last_name;
    // const user_Id = query.from.id;

    // function to check if query.data is a json type
    function isJSON(str) {
      try {
        JSON.parse(str);
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }

    if (isJSON(query.data)) {
      command = JSON.parse(query.data).command;
      //   markdownId = JSON.parse(query.data).eventDetailsId;
    } else {
      command = query.data;
    }

    const chatId = query.message.chat.id;
    // const userId = query.from.id;

    try {
      await this.starkBuddyBot.sendChatAction(chatId, 'typing');
      const user = await this.UserModel.findOne({ chatId: chatId });
      let session: SessionDocument;
      switch (command) {
        case '/menu':
          await this.sendAllFeature(user);
          // await this.sendAllFeatureKeyboard(chatId);
          return;

        case '/walletFeatures':
          await this.sendAllWalletFeature(chatId);
          return;

        case '/enableRebalance':
          if (user && !user.rebalanceEnabled) {
            await this.UserModel.updateOne(
              { chatId },
              { rebalanceEnabled: true },
            );
            return this.starkBuddyBot.sendMessage(
              chatId,
              ` Rebalancing Enabled`,
            );
          } else if (user && user.rebalanceEnabled) {
            await this.UserModel.updateOne(
              { chatId },
              { rebalanceEnabled: false },
            );
            return this.starkBuddyBot.sendMessage(
              chatId,
              ` Rebalancing Disabled`,
            );
          }
          return;

        case '/linkWallet':
          // check if user already have a wallet
          if (user!.walletAddress) {
            await this.starkBuddyBot.sendMessage(
              query.message.chat.id,
              `‼️ You already have a wallet\n\nto link a new, make sure to export and secure you old wallet and then click on the reset wallet button`,
            );
            return this.sendWalletDetails(chatId, user!.walletAddress);
          }
          // delete any existing session if any
          await this.SessionModel.deleteMany({ chatId: chatId });
          // create a new session
          session = await this.SessionModel.create({
            chatId: chatId,
            importWallet: true,
          });
          if (session) {
            await this.promptWalletPrivateKEY(chatId);
            return;
          }
          return await this.starkBuddyBot.sendMessage(
            query.message.chat.id,
            `Processing command failed, please try again`,
          );

        case '/fundWallet':
          if (user?.walletAddress) {
            return await this.starkBuddyBot.sendMessage(
              chatId,
              `Your Address:\n<b><code>${user?.walletAddress}</code></b>\n\n send token to your address above `,
              {
                parse_mode: 'HTML',
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: 'Close ❌',
                        callback_data: JSON.stringify({
                          command: '/close',
                          language: 'english',
                        }),
                      },
                    ],
                  ],
                },
              },
            );
          }
          return await this.starkBuddyBot.sendMessage(
            chatId,
            'You dont have any wallet Address to fund',
          );

        case '/checkBalance':
        //   return this.showBalance(chatId);

        case '/exportWallet':
          if (!user!.walletDetails) {
            return this.starkBuddyBot.sendMessage(
              chatId,
              `You Don't have a wallet`,
            );
          }
          return this.showExportWalletWarning(chatId);

        // case '/confirmExportWallet':
        //   // delete any existing session if any
        //   await this.SessionModel.deleteMany({ chatId: chatId });
        //   // create a new session
        //   session = await this.SessionModel.create({
        //     chatId: chatId,
        //     exportWallet: true,
        //   });
        //   if (session && user!.walletDetails) {
        //     const decryptedWallet = await this.walletService.decryptWallet(
        //       process.env.DEFAULT_WALLET_PIN!,
        //       user!.walletDetails,
        //     );

        //     if (decryptedWallet.privateKey) {
        //       const latestSession = await this.SessionModel.findOne({
        //         chatId: chatId,
        //       });
        //       const deleteMessagesPromises = [
        //         ...latestSession!.userInputId.map((id) =>
        //           this.starkBuddyBot.deleteMessage(chatId, id),
        //         ),
        //       ];

        //       // Execute all deletions concurrently
        //       await Promise.all(deleteMessagesPromises);

        //       // Display the decrypted private key to the user
        //       await this.displayWalletPrivateKey(
        //         chatId,
        //         decryptedWallet.privateKey,
        //       );

        //       // console.log(
        //       //   'Decrypted wallet private key:',
        //       //   decryptedWallet.privateKey,
        //       //   'Wallet address:',
        //       //   user!.walletAddress,
        //       // );
        //       return;
        //     }

        //     // Delete the session after operations
        //     await this.SessionModel.deleteMany({ chatId: chatId });
        //   }
        //   return await this.starkBuddyBot.sendMessage(
        //     query.message.chat.id,
        //     `Processing command failed, please try again`,
        //   );

        case '/resetWallet':
          return this.showResetWalletWarning(chatId);

        case '/confirmReset':
          // delete any existing session if any
          await this.SessionModel.deleteMany({ chatId: chatId });
          // create a new session
          session = await this.SessionModel.create({
            chatId: chatId,
            resetWallet: true,
          });
          if (session) {
            try {
              await this.starkBuddyBot.sendChatAction(chatId, 'typing');
              if (!user) {
                return await this.starkBuddyBot.sendMessage(
                  chatId,
                  'User not found. Please try again.',
                );
              }

              await this.UserModel.updateOne(
                { chatId: chatId },
                {
                  $unset: {
                    walletAddress: '',
                    walletDetails: '',
                    privateKey: '',
                  },
                },
              );

              await this.starkBuddyBot.sendMessage(
                chatId,
                'Wallet deleted successfully, you can now create or import a new wallet',
              );
              await this.SessionModel.deleteMany();
              return;
            } catch (error) {
              console.log(error);
            }
          }
          return await this.starkBuddyBot.sendMessage(
            query.message.chat.id,
            `Processing command failed, please try again`,
          );

        case '/tokenInsight':
          await this.SessionModel.deleteMany({ chatId: chatId });
          session = await this.SessionModel.create({
            chatId: chatId,
            tokenInsight: true,
          });
          if (session) {
            await this.promptTokenAddress(chatId);
            return;
          }
          return await this.starkBuddyBot.sendMessage(
            query.message.chat.id,
            `Processing command failed, please try again`,
          );

        case '/linkToApp':
          return this.linkBotToAppMarkup(chatId, user);

        case '/setTargetAllocation':
          await this.starkBuddyBot.sendChatAction(chatId, 'typing');
          return await this.setTargetAllocation(chatId);

        case '/setThreshold':
          await this.starkBuddyBot.sendChatAction(chatId, 'typing');
          return await this.setThreshold(chatId);

        //   close opened markup and delete session
        case '/closeDelete':
          await this.starkBuddyBot.sendChatAction(
            query.message.chat.id,
            'typing',
          );
          await this.SessionModel.deleteMany({
            chatId: chatId,
          });
          return await this.starkBuddyBot.deleteMessage(
            query.message.chat.id,
            query.message.message_id,
          );

        case '/close':
          await this.starkBuddyBot.sendChatAction(
            query.message.chat.id,
            'typing',
          );
          return await this.starkBuddyBot.deleteMessage(
            query.message.chat.id,
            query.message.message_id,
          );

        default:
          return await this.starkBuddyBot.sendMessage(
            query.message.chat.id,
            `Processing command failed, please try again`,
          );
      }
    } catch (error) {
      console.log(error);
    }
  };

  sendAllFeature = async (user: UserDocument) => {
    try {
      await this.starkBuddyBot.sendChatAction(user.chatId, 'typing');
      const allFeatures = await allFeaturesMarkup();
      if (allFeatures) {
        const replyMarkup = {
          inline_keyboard: allFeatures.keyboard,
        };
        await this.starkBuddyBot.sendMessage(user.chatId, allFeatures.message, {
          parse_mode: 'HTML',
          reply_markup: replyMarkup,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  sendAllWalletFeature = async (chatId: any) => {
    try {
      await this.starkBuddyBot.sendChatAction(chatId, 'typing');
      const allWalletFeatures = await walletFeaturesMarkup();
      if (allWalletFeatures) {
        const replyMarkup = {
          inline_keyboard: allWalletFeatures.keyboard,
        };
        await this.starkBuddyBot.sendMessage(
          chatId,
          allWalletFeatures.message,
          {
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  sendWalletDetails = async (
    ChatId: TelegramBot.ChatId,
    walletAddress: string,
  ) => {
    await this.starkBuddyBot.sendChatAction(ChatId, 'typing');
    try {
      const walletDetails = await wallerDetailsMarkup(walletAddress);
      if (wallerDetailsMarkup!) {
        const replyMarkup = {
          inline_keyboard: walletDetails.keyboard,
        };

        return await this.starkBuddyBot.sendMessage(
          ChatId,
          walletDetails.message,
          {
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  promptWalletPrivateKEY = async (chatId: TelegramBot.ChatId) => {
    try {
      await this.starkBuddyBot.sendChatAction(chatId, 'typing');
      const privateKeyPromptId = await this.starkBuddyBot.sendMessage(
        chatId,
        `Please enter wallet's private key`,
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      if (privateKeyPromptId) {
        await this.SessionModel.updateOne(
          { chatId: chatId },
          {
            importWalletPromptInput: true,
            $push: { importWalletPromptInputId: privateKeyPromptId.message_id },
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  //   showBalance = async (chatId: TelegramBot.ChatId) => {
  //     try {
  //       await this.starkBuddyBot.sendChatAction(chatId, 'typing');
  //       const user = await this.UserModel.findOne({ chatId: chatId });
  //       if (!user?.walletAddress) {
  //         return this.starkBuddyBot.sendMessage(
  //           chatId,
  //           `You don't have a wallet connected`,
  //         );
  //       }

  //       const ethBalance = await this.walletService.getEthBalance(
  //         user!.walletAddress,
  //       );
  //       console.log('this is eth balance :', ethBalance);
  //       // const usdcBalance = await this.walletService.getERC20Balance(
  //       //   user!.walletAddress,
  //       //   USDC_ADDRESS,
  //       // );

  //       const usdcMantleBalance = await this.walletService.getERC20Balance(
  //         user!.walletAddress,
  //         USDC_ADDRESS_MANTLE,
  //       );

  //       // const modeBalance = await this.walletService.getERC20Balance(
  //       //   user!.walletAddress,
  //       //   MODE_ADDRESS,
  //       // );
  //       console.log('this is eth balance :', usdcMantleBalance);
  //       const wmntBalance = await this.walletService.getERC20Balance(
  //         user!.walletAddress,
  //         WMNT_ADDRESS,
  //       );

  //       // const showBalance = await showBalanceMarkup(
  //       //   ethBalance.balance,
  //       //   usdcBalance.balance,
  //       //   modeBalance.balance,
  //       // );

  //       const showBalance = await showBalanceMarkup(
  //         ethBalance.balance,
  //         usdcMantleBalance.balance,
  //         wmntBalance.balance,
  //       );
  //       if (showBalance) {
  //         const replyMarkup = { inline_keyboard: showBalance.keyboard };

  //         return await this.starkBuddyBot.sendMessage(
  //           chatId,
  //           showBalance.message,
  //           {
  //             parse_mode: 'HTML',
  //             reply_markup: replyMarkup,
  //           },
  //         );
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  showExportWalletWarning = async (chatId: TelegramBot.ChatId) => {
    try {
      await this.starkBuddyBot.sendChatAction(chatId, 'typing');
      const showExportWarning = await exportWalletWarningMarkup();
      if (showExportWarning) {
        const replyMarkup = { inline_keyboard: showExportWarning.keyboard };

        return await this.starkBuddyBot.sendMessage(
          chatId,
          showExportWarning.message,
          {
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  //   showUserPortfolio = async (user: UserDocument) => {
  //     try {
  //       await this.starkBuddyBot.sendChatAction(user.chatId, 'typing');
  //       const userPortfolio = await this.getPortfolio(user.linkCode);
  //       const showPortfolio = await showPortfolioMarkup(userPortfolio);
  //       if (showPortfolio) {
  //         const replyMarkup = { inline_keyboard: showPortfolio.keyboard };

  //         return await this.starkBuddyBot.sendMessage(
  //           user.chatId,
  //           showPortfolio.message,
  //           {
  //             parse_mode: 'HTML',
  //             reply_markup: replyMarkup,
  //           },
  //         );
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  linkBotToAppMarkup = async (
    chatId: TelegramBot.ChatId,
    user: UserDocument,
  ) => {
    try {
      await this.starkBuddyBot.sendChatAction(chatId, 'typing');
      if (user.linkCode) {
        const linkAppMarkup = await linkToAppMarkup(user.linkCode);
        const replyMarkup = { inline_keyboard: linkAppMarkup.keyboard };

        return await this.starkBuddyBot.sendMessage(
          chatId,
          linkAppMarkup.message,
          {
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  // utitlity functions
  isPrivateKey = async (input: string, chatId: number): Promise<boolean> => {
    const latestSession = await this.SessionModel.findOne({ chatId: chatId });
    const trimmedInput = input.trim();
    const privateKeyRegex = /^0x[a-fA-F0-9]{64}$/;
    if (privateKeyRegex.test(trimmedInput)) {
      return true;
    } else if (latestSession) {
      if (latestSession!.importWallet) {
        this.starkBuddyBot.sendMessage(chatId, 'Invalid Private KEY');
      }

      const promises: any[] = [];
      // loop through  import privateKey prompt to delete them
      for (let i = 0; i < latestSession.importWalletPromptInputId.length; i++) {
        try {
          promises.push(
            await this.starkBuddyBot.deleteMessage(
              chatId,
              latestSession!.importWalletPromptInputId[i],
            ),
          );
        } catch (error) {
          console.log(error);
        }
      }
      // loop through to delet all userReply
      for (let i = 0; i < latestSession.userInputId.length; i++) {
        try {
          promises.push(
            await this.starkBuddyBot.deleteMessage(
              chatId,
              latestSession.userInputId[i],
            ),
          );
        } catch (error) {
          console.log(error);
        }
      }
      return false;
    }
    return false;
  };

  displayWalletPrivateKey = async (
    chatId: TelegramBot.ChatId,
    privateKey: string,
  ) => {
    try {
      await this.starkBuddyBot.sendChatAction(chatId, 'typing');
      const displayPrivateKey = await displayPrivateKeyMarkup(privateKey);
      if (displayPrivateKey) {
        const replyMarkup = { inline_keyboard: displayPrivateKey.keyboard };

        const sendPrivateKey = await this.starkBuddyBot.sendMessage(
          chatId,
          displayPrivateKey.message,
          {
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          },
        );
        if (sendPrivateKey) {
          // Delay the message deletion by 1 minute
          setTimeout(async () => {
            try {
              // Delete the message after 1 minute
              await this.starkBuddyBot.deleteMessage(
                chatId,
                sendPrivateKey.message_id,
              );
            } catch (error) {
              console.error('Error deleting message:', error);
            }
          }, 60000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  showResetWalletWarning = async (chatId: TelegramBot.ChatId) => {
    try {
      await this.starkBuddyBot.sendChatAction(chatId, 'typing');
      const showResetWarning = await resetWalletWarningMarkup();
      if (showResetWarning) {
        const replyMarkup = { inline_keyboard: showResetWarning.keyboard };

        return await this.starkBuddyBot.sendMessage(
          chatId,
          showResetWarning.message,
          {
            parse_mode: 'HTML',
            reply_markup: replyMarkup,
          },
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  //utils function
  generateUniqueAlphanumeric = async (): Promise<string> => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    while (result.length < 8) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
      if (!result.includes(randomChar)) {
        result += randomChar;
      }
    }
    return result;
  };

  linkBotToApp = async (uniquecode: string) => {
    try {
      const user = await this.UserModel.findOne({ linkCode: uniquecode });

      if (user) {
        return {
          username: user.userName,
          walletAddress: user.walletAddress,
          profileImage: `${process.env.BASE_URL}/rebalancr-bot/profile-photo/${user.chatId}`,
        };
      }
    } catch (error) {
      console.log(error);
    }
  };

  getProfilePhoto = async (chatId: number) => {
    try {
      const photos = await this.starkBuddyBot.getUserProfilePhotos(chatId, {
        limit: 1,
      });
      console.log(photos.photos);

      if (photos.total_count > 0 && photos.photos[0].length >= 3) {
        const fileId = photos.photos[0][2].file_id;
        const file = await this.starkBuddyBot.getFile(fileId);
        const filePath = file.file_path;

        const photoUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const photoResponse = await fetch(photoUrl);
        if (photoResponse) {
          const arrayBuffer = await photoResponse.arrayBuffer();
          if (arrayBuffer) {
            const buffer = await Buffer.from(arrayBuffer);
            if (buffer) {
              return { photoResponse, buffer };
            }
          }
        }
      } else if (photos.total_count > 0) {
        const fileId = photos.photos[0][0].file_id;
        const file = await this.starkBuddyBot.getFile(fileId);
        const filePath = file.file_path;

        const photoUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
        const photoResponse = await fetch(photoUrl);
        if (photoResponse) {
          const arrayBuffer = await photoResponse.arrayBuffer();
          if (arrayBuffer) {
            const buffer = await Buffer.from(arrayBuffer);
            if (buffer) {
              return { photoResponse, buffer };
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  promptTokenAddress = async (chatId: TelegramBot.ChatId) => {
    try {
      await this.starkBuddyBot.sendChatAction(chatId, 'typing');
      const tokenPromptId = await this.starkBuddyBot.sendMessage(
        chatId,
        `Please enter the token address`,
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );
      return tokenPromptId;
    } catch (error) {
      console.log(error);
    }
  };

  setTargetAllocation = async (chatId: TelegramBot.ChatId) => {
    try {
      await this.SessionModel.updateOne(
        { chatId },
        { thresholdSetting: false, allocationSetting: true },
        { upsert: true },
      );
      const promptId = await this.starkBuddyBot.sendMessage(
        chatId,
        'Input your Target  allocation % for usdc and mode. e.g 60% 40%',
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );

      return promptId;
    } catch (error) {
      console.log(error);
    }
  };

  setThreshold = async (chatId: TelegramBot.ChatId) => {
    try {
      await this.SessionModel.updateOne(
        { chatId },
        { thresholdSetting: true, allocationSetting: false },
        { upsert: true },
      );
      const promptId = await this.starkBuddyBot.sendMessage(
        chatId,
        'Input the upper and lower threshold % eg: 45% 35%',
        {
          reply_markup: {
            force_reply: true,
          },
        },
      );

      return promptId;
    } catch (error) {
      console.log(error);
    }
  };

  //   getPortfolio = async (linkCode: string) => {
  //     try {
  //       const user = await this.UserModel.findOne({ linkCode });
  //       if (!user?.walletAddress) {
  //         return { message: ` you don't have a wallet connected on the bot` };
  //       }

  //       const ethBalance = await this.walletService.getEthBalance(
  //         user!.walletAddress,
  //       );
  //       const usdcBalance = await this.walletService.getERC20Balance(
  //         user!.walletAddress,
  //         USDC_ADDRESS,
  //       );
  //       const modeBalance = await this.walletService.getERC20Balance(
  //         user!.walletAddress,
  //         MODE_ADDRESS,
  //       );
  //       const geckoUrl = `https://api.geckoterminal.com/api/v2/networks/mode/tokens`;

  //       const urls = [
  //         `${geckoUrl}/0x4200000000000000000000000000000000000006`,
  //         `${geckoUrl}/0xd988097fb8612cc24eeC14542bC03424c656005f`,
  //         `${geckoUrl}/0xDfc7C877a950e49D2610114102175A06C2e3167a`,
  //       ];

  //       const [ethData, usdcData, modeData] = await Promise.all(
  //         urls.map((url) =>
  //           fetch(url, { method: 'GET' }).then((response) => response.json()),
  //         ),
  //       );

  //       const eth = {
  //         ethBalance: ethBalance.balance || '0',
  //         price: ethData.data.attributes.price_usd || '0',
  //         value:
  //           Number(ethBalance.balance || '0') *
  //           Number(ethData.data.attributes.price_usd || '0'),
  //       };
  //       const usdc = {
  //         usdcBalance: usdcBalance.balance || '0',
  //         price: usdcData.data.attributes.price_usd || '0',
  //         value: Number(usdcBalance.balance || '0'),
  //       };
  //       const mode = {
  //         modeBalance: modeBalance.balance || '0',
  //         price: modeData.data.attributes.price_usd || '0',
  //         value:
  //           Number(modeData.data.attributes.price_usd || '0') *
  //           Number(modeBalance.balance || '0'),
  //       };

  //       return { eth, usdc, mode };
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   private rebalancePortfolio = async (user: UserDocument) => {
  //     function calculatePercentage(value1, value2) {
  //       const total = value1 + value2;
  //       if (total === 0) return { percentage1: 0, percentage2: 0 }; // To avoid division by zero

  //       const percentage1 = (value1 / total) * 100;
  //       const percentage2 = (value2 / total) * 100;

  //       return {
  //         percentage1: percentage1.toFixed(2),
  //         percentage2: percentage2.toFixed(2),
  //       };
  //     }

  //     try {
  //       // Destructuring the user object to get thresholds and allocations
  //       const { upperThreshold, lowerThreshold, modeAllocation } = user;

  //       const userPortfolio = await this.getPortfolio(user.linkCode);
  //       const totalPortfoliosize = Number(
  //         userPortfolio.mode.value + userPortfolio.usdc.value,
  //       );
  //       const portfolioPercentages = calculatePercentage(
  //         userPortfolio.mode.value,
  //         userPortfolio.usdc.value,
  //       );
  //       const modePercentage = Number(portfolioPercentages.percentage1);

  //       // Check if rebalancing is needed
  //       if (modePercentage > Number(upperThreshold)) {
  //         // Calculate how much MODE to sell
  //         const modeValueToSell =
  //           ((modePercentage - Number(modeAllocation)) / 100) *
  //           totalPortfoliosize;

  //         const actualModeTokenToSell =
  //           Number(modeValueToSell) / Number(userPortfolio.mode.price);
  //         console.log(
  //           `Selling ${actualModeTokenToSell} worth of MODE to rebalance.`,
  //         );

  //         await this.promptAgentToRebalance(
  //           user,
  //           `Swap ${actualModeTokenToSell} mode to usdc`,
  //         );
  //         // Example: await this.sellAsset('MODE', modeToSell);
  //       } else if (modePercentage < Number(lowerThreshold)) {
  //         // Calculate how much USDC to buy MODE with
  //         const usdcToSpend =
  //           ((Number(modeAllocation) - modePercentage) / 100) *
  //           totalPortfoliosize;
  //         console.log(`Buying ${usdcToSpend} worth of MODE to rebalance.`);

  //         await this.promptAgentToRebalance(
  //           user,
  //           `Swap ${usdcToSpend} usdc to mode`,
  //         );
  //       } else {
  //         console.log(
  //           'Portfolio is within acceptable balance, no action needed.',
  //         );
  //       }
  //     } catch (error) {
  //       console.error('Error during portfolio rebalancing:', error);
  //     }
  //   };

  validateAllocations = async (input: string, chatId: number) => {
    // Match numbers followed by an optional space and %
    const matches = input.match(/(\d{1,3})\s*%/g);

    // 🚩 Error Handling: Invalid Format
    if (!matches || matches.length !== 2) {
      await this.starkBuddyBot.sendMessage(
        chatId,
        'Invalid input format. Example of valid input: "60% 40%"',
      );
      return; // Exit early if invalid
    }

    // ✅ Conversion: Extract numbers
    const allocations = matches.map((value) =>
      parseInt(value.replace('%', '')),
    );

    // 🚩 Validation: Sum must be 100
    const total = allocations.reduce((sum, num) => sum + num, 0);
    if (total !== 100) {
      await this.starkBuddyBot.sendMessage(
        chatId,
        `Allocations must sum to 100. Current sum: ${total}`,
      );
      return; // Exit early if invalid
    }

    console.log(allocations);
    return { allocation1: allocations[0], allocation2: allocations[1] };
  };

  validateThresholds = async (input: string, chatId: number) => {
    const matches = input.match(/(\d{1,3})\s*%/g);

    if (!matches || matches.length !== 2) {
      await this.starkBuddyBot.sendMessage(
        chatId,
        'Invalid input format. Example of valid input: "70% 30%"',
      );
      return;
    }

    const thresholds = matches.map((value) => parseInt(value.replace('%', '')));

    const invalidValues = thresholds.filter((t) => t < 0 || t > 100);
    if (invalidValues.length > 0) {
      await this.starkBuddyBot.sendMessage(
        chatId,
        `Threshold values must be between 0% and 100%. Invalid values: ${invalidValues.join(', ')}%`,
      );
      return; // Exit early if invalid
    }

    console.log(thresholds);
    return { upperThreshold: thresholds[0], lowerThreshold: thresholds[1] };
  };

  // @Cron('*/1 * * * *')
  // async handleRebalancing() {
  //   console.log('running cron');
  //   try {
  //     const users = await this.UserModel.find();

  //     for (const user of users) {
  //       if (user.rebalanceEnabled) {
  //         // Check if rebalancing is turned on
  //         await this.rebalancePortfolio(user);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error fetching users or rebalancing:', error);
  //   }
  // }
}
