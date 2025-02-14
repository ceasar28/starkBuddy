export const displayPrivateKeyMarkup = async (privateKey: string) => {
  return {
    message: `Your Private Key is:\n\n <code>${privateKey}</code> \n\nYou can now e.g. import the key into a wallet like coinbase wallet, metamask etc (tap to copy)\nThis message should auto-delete in 1 minute. If not, delete this message once you are done.`,
    keyboard: [
      [
        {
          text: 'Delete 🗑️',
          callback_data: JSON.stringify({
            command: '/close',
            language: 'english',
          }),
        },
      ],
    ],
  };
};
