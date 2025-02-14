export const allFeaturesMarkup = async () => {
  return {
    message: `Please Select any action below 👇`,
    keyboard: [
      [
        {
          text: '💳 Wallet',
          callback_data: JSON.stringify({
            command: '/walletFeatures',
            language: 'english',
          }),
        },
      ],
      [
        {
          text: '📈 Token Insights',
          callback_data: JSON.stringify({
            command: '/tokenInsight',
            language: 'english',
          }),
        },
      ],
      [
        {
          text: 'Swap tokens 🔄',
          callback_data: JSON.stringify({
            command: '/swap',
            language: 'english',
          }),
        },
      ],
      [
        {
          text: '📢 Share',
          language: 'english',
          switch_inline_query: 'StarkBuddy, Defi AGENT!.',
        },
      ],
      [
        {
          text: '❓ Help & Support',
          url: `https://t.me/+uvluoEnCbiU5YTBk`,
        },
      ],
    ],
  };
};
