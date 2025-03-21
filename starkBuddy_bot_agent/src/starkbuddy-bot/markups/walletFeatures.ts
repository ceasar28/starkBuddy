export const walletFeaturesMarkup = async () => {
  return {
    message: `Please Select any action below 👇`,
    keyboard: [
      [
        {
          text: 'Import Starknet wallet 🔗',
          callback_data: JSON.stringify({
            command: '/linkWallet',
            language: 'english',
          }),
        },
      ],
      [
        {
          text: 'Fund wallet 💵',
          callback_data: JSON.stringify({
            command: '/fundWallet',
            language: 'english',
          }),
        },
        {
          text: 'Reset wallet',
          callback_data: JSON.stringify({
            command: '/resetWallet',
            language: 'english',
          }),
        },
      ],
      [
        {
          text: 'Export wallet',
          callback_data: JSON.stringify({
            command: '/exportWallet',
            language: 'english',
          }),
        },
      ],
      [
        {
          text: 'close ❌',
          callback_data: JSON.stringify({
            command: '/close',
            language: 'english',
          }),
        },
      ],
    ],
  };
};
