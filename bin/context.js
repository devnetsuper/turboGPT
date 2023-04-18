//const fs = require("fs");

//const contextFile = `${__dirname}/../data/context-terminal-gpt.txt`;
let context = [];

const addContext = (text) => {
  console.log(`Adding context: ${text}`);
  context = [...context, text];
  console.log(`Current context: ${context}`);
};

const getContext = () => {
  console.log(`Returning context: ${context}`);
  return context;
};


export { addContext, getContext };
