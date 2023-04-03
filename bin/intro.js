import pkg from 'chalk';
const { white, greenBright, magentaBright, redBright } = pkg;

const intro = () => {
  const usageText = `
  ${white.bold("****************")} Welcome to ${greenBright(
    "turboGPT"
  )} ${white.bold("****************")}

  ${magentaBright("usage:")}
    TurboGPT will ask you to add your OpenAI API key. Don't worry, it will be saved on your machine locally.

    TurboGPT will prompt you to enter a message. Type your message and press enter.
    TurboGPT will then prompt you to enter a response. Type your response and press enter.

    To exit, type "${redBright("exit")}" and press enter.

    # Commands

  `;

  console.log(usageText);
};

export { intro };
