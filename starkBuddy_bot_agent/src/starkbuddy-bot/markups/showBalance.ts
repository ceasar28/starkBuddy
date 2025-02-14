export const showBalanceMarkup = async (
  ethBalance: number,
  usdcBalance: number,
  modeBalance: number,
) => {
  return {
    message: `<b>Wallet Balance:</b>:\n\n➤ ${ethBalance} <b>ETH</b>\n➤ ${usdcBalance} <b>USDC</b>\n➤ ${modeBalance} <b>MODE</b>`,
    keyboard: [
      [
        {
          text: 'Fund wallet 💵',
          callback_data: JSON.stringify({
            command: '/fundWallet',
            language: 'english',
          }),
        },
      ],
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
