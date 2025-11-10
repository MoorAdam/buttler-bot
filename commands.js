import "dotenv/config";
import { getRPSChoices } from "./game.js";
import { capitalize, InstallGlobalCommands } from "./utils.js";

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: "test",
  description: "Basic command",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Command containing options
// const CHALLENGE_COMMAND = {
//   name: "challenge",
//   description: "Challenge to a match of rock paper scissors",
//   options: [
//     {
//       type: 3,
//       name: "object",
//       description: "Pick your object",
//       required: true,
//       choices: createCommandChoices(),
//     },
//   ],
//   type: 1,
//   integration_types: [0, 1],
//   contexts: [0, 2],
// };

// Explain command
const EXPLAIN_COMMAND = {
  name: "explain",
  description: "Explains concepts",
  type: 1,
  integration_types: [0, 1],
  options: [
    {
      type: 3,
      name: "topic",
      description: "The topic you want explained",
      required: true,
    }
  ],
  contexts: [0, 1, 2],
};

const YES_COMMAND = {
  name: "yes",
  description: "A test YES command",
  type: 1,
  integration_types: [0, 1],
  options: [
    {
      type: 3,
      name: "topic",
      description: "The topic you want explained",
      required: true,
    }
  ],
  contexts: [0, 1, 2],
};

// Chuck Norris joke command
const CHUCK_NORRIS_COMMAND = {
  name: "chucknorris",
  description: "Get a random Chuck Norris joke",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [
  TEST_COMMAND, 
  YES_COMMAND,
  // CHALLENGE_COMMAND, 
  EXPLAIN_COMMAND,
  CHUCK_NORRIS_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
