import { Configuration, OpenAIApi } from "openai";
import pkg from 'chalk';
const { red } = pkg;
import { loadWithRocketGradient } from "./gradient.js";
import { addContext } from "./context.js";
import { getContext } from "./context.js";


const generateCompletion = async (apiKey, prompt) => {
  try {
    
    const configuration = new Configuration({
      apiKey,
    });

    const openai = new OpenAIApi(configuration);
    const spinner = loadWithRocketGradient("Thinking...").start();
    
    addContext({"role": "user", "content": prompt});
    addContext({"role": "system", "content": "Read the context, when returning the answer ,always wrapping block of code exactly within triple backticks"});

    const request = await openai.createChatCompletion({
      model:"gpt-3.5-turbo",
      messages:getContext(),
    })
      .then((res) => {
        addContext(res.data.choices[0].message);
        spinner.stop();
        return res.data.choices[0].message;
      })
      .catch((err) => {
        if (err["response"]["status"] == "404") {
          console.error(
            `${red(
              "\nNot Found: Model not found. Please check the model name."
            )}`
          );
        }
        if (err["response"]["status"] == "429") {
          console.error(
            `${red(
              "\nAPI Rate Limit Exceeded: ChatGPT is getting too many requests from the user in a short period of time. Please wait a while before sending another message."
            )}`
          );
        }
        if (err["response"]["status"] == "400") {
          console.error(
            `${red(
              "\nBad Request: Prompt provided is empty or too long. Prompt should be between 1 and 4096 tokens."
            )}`
          );
        }
        if (err["response"]["status"] == "402") {
          console.error(
            `${red(
              "\nPayment Required: ChatGPT quota exceeded. Please check you chatGPT account."
            )}`
          );
        }
        if (err["response"]["status"] == "503") {
          console.error(
            `${red(
              "\nService Unavailable: ChatGPT is currently unavailable, possibly due to maintenance or high traffic. Please try again later."
            )}`
          );
        } else {
          console.error(`${red("Something went wrong!!!")} ${err}`);
        }

        spinner.stop();
        return "error";
      });

    if (request == undefined || !request?.content) {
      throw new Error("Something went wrong!");
    }

    return request;
  } catch (error) {
    console.error(`${red("Something went wrong!!")} ${error}`);
  }
};

export { generateCompletion };
