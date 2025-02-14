import * as dotenv from 'dotenv';
dotenv.config();

export const linkToAppMarkup = async (code: string) => {
  return {
    message: `🔗 Link Rebalancr to the App:\n\n We’ve generated a unique code just for you: <code>${code}</code> \n\n📋 Tap to Copy: Simply click the code to copy it.\n📱 Next Step: Paste this code in the app to link your account with the bot.`,
    keyboard: [
      [
        {
          text: 'Go to app 📱',
          url: `${process.env.APP_URL}`,
        },
      ],
      [
        {
          text: '❌ close',
          callback_data: JSON.stringify({
            command: '/close',
            language: 'english',
          }),
        },
      ],
    ],
  };
};
