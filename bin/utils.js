import { writeSync } from "clipboardy";
import { encrypt, saveApiKey, getApiKey } from "./encrypt.js";
import prompts from "prompts";
import pkg from 'chalk';
const { cyan, red } = pkg;
import { stdout, exit } from "process";
import { generateCompletion } from "./gpt.js";

const apiKeyPrompt = async () => {
  let apiKey = getApiKey();

  if (!apiKey) {
    const response = await prompts({
      type: "password",
      name: "apiKey",
      message: "Enter your OpenAI API key:",
      validate: (value) => {
        return value !== "";
      },
    });

    apiKey = response.apiKey;
    saveApiKey(encrypt(apiKey));
  }

  return apiKey;
};

const checkBlockOfCode = async (text, prompt) => {
  // get all matches of text within ```
  const regex = /```[\s\S]*?```/g;
  const matches = text.match(regex);
  if (!matches) {
    prompt();
  } else {
    const recentText = matches[0];
    const recentTextNoBackticks = recentText.replace(/```/g, "");
    const response = await prompts({
      type: "confirm",
      name: "copy",
      message: `Copy recent code to clipboard?`,
      initial: true,
    });

    if (response.copy) {
      writeSync(recentTextNoBackticks);
      prompt();
    } else {
      prompt();
    }
  }
};

const generateResponse = async (apiKey, prompt, text) => {
  try {
    console.log(apiKey)
    const request = await generateCompletion(apiKey, text);

    if (request == undefined || !request?.content) {
      throw new Error("Something went wrong!");
    }

    // map all choices to text
    const getText = [request.content];

    console.log(`${cyan("GPT-3: ")}`);
    // console log each character of the text with a delay and then call prompt when it finished
    let i = 0;
    const interval = setInterval(() => {
      if (i < getText[0].length) {
        stdout.write(getText[0][i]);
        i++;
      } else {
        clearInterval(interval);
        console.log("\n");
        checkBlockOfCode(getText[0], prompt);
      }
    }, 10);
  } catch (err) {
    console.error(`${red("1 Something went wrong!!")} ${err}`);
    // create a prompt of type select , with the options to exit or try again
    const response = await prompts({
      type: "select",
      name: "value",
      message: "Try again?",
      choices: [
        { title: "Yes", value: "yes" },
        { title: "No - exit", value: "no" },
      ],
      initial: 0,
    });

    switch (response.value) {
      case "no":
        return exit(0);
      case "yes":
      default:
        // call the function again
        generateResponse(apiKey, prompt, text);
        break;
    }
  }
};

export {
  apiKeyPrompt,
  generateResponse,
};
