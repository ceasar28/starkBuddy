export const showPortfolioMarkup = async (data: any) => {
  return {
    message: `<b>Your Portfolio:</b>:\n\n<b>➤ ETH :</b>\n - Balance: ${data.eth.ethBalance} ETH\n - Value: ${data.eth.value}\n - Price: ${data.eth.price}\n\n<b>➤ USDC :</b>\n - Balance: ${data.usdc.usdcBalance} USDC\n - Value: ${data.usdc.value}\n - Price: ${data.usdc.price}\n\n<b>➤ MODE :</b>\n - Balance: ${data.mode.modeBalance} MODE\n - Value: ${data.mode.value}\n - Price: ${data.mode.price}`,
    keyboard: [
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
  };
};
