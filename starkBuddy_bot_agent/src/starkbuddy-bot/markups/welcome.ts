export const welcomeMessageMarkup = async (userName: string) => {
  console.log(userName);
  return {
    message: `Hi @${userName} 👋, Welcome to <b>StarkBuddy</b> Defi Agent\n\nhere is what I can do: 👇\n- Send tokens\n- token swaps\n- AI-Driven Market & sentiment Analysis.`,

    keyboard: [
      [
        {
          text: 'Lets get started 🚀',
          callback_data: JSON.stringify({
            command: '/menu',
            language: 'english',
          }),
        },
      ],
    ],
  };
};
