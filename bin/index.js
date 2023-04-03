#!/usr/bin/env node

import prompts from "prompts";
import pkg from 'chalk';
const { blueBright } = pkg;
import { exit, stdout, argv } from "process";
import { intro } from "./intro.js";
import { apiKeyPrompt, generateResponse } from "./utils.js";
import { deleteApiKey } from "./encrypt.js";
import { saveApiKey } from "./encrypt.js";


import { program as commander } from 'commander';

commander.command("chat")
  .option("-e, --engine <engine>", "GPT-3 model to use")
  .option("-t, --temperature <temperature>", "Response temperature")
  .option(
    "-f,--finetunning <finetunning>",
    "Opt in to pretrain the model with a prompt"
  )
  .option("-l,--limit <limit>", "The limit of prompts to train the model with")
  .usage(`"<project-directory>" [options]`)
  .action(async () => {
    intro();
    apiKeyPrompt().then(async (apiKey) => {
      const prompt = async () => {
        const response = await prompts({
          type: "text",
          name: "value",
          message: `${blueBright("You: ")}`,
          validate: () => {
            return true;
          },
          onState: (state) => {
            if (state.aborted) {
              exit(0);
            }
          }
        });

        switch (response.value) {
          case "exit":
            return exit(0);
          case "clear":
            return stdout.write("\x1Bc");
          default:
            generateResponse(apiKey, prompt, response);
            return;
        }
      };

      // Use a while loop to continuously prompt the user for input
      while (true) {
        await prompt();
      }
    });
  });

// create commander to delete api key

commander.command("delete")
  .description("Delete your API key")
  .action(async () => {
    const response = await prompts({
      type: "select",
      name: "value",
      message: "Are you sure?",
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
        deleteApiKey();
        break;
    }
    deleteApiKey();
    console.log("API key deleted");
  });

commander.parse(argv);
