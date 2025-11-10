import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads the bot's commands.js file and extracts command information
 * Returns an array of commands with name and description
 */
export async function getCommandsFromFile() {
  try {
    // Path to the bot's commands.js file (two directories up from backend)
    const commandsFilePath = path.join(__dirname, '../../commands.js');
    
    // Check if file exists
    if (!fs.existsSync(commandsFilePath)) {
      console.error('Commands file not found at:', commandsFilePath);
      return [];
    }

    // Read the file content
    const fileContent = fs.readFileSync(commandsFilePath, 'utf-8');
    
    // Parse commands from the file
    const commands = parseCommands(fileContent);
    
    return commands;
  } catch (error) {
    console.error('Error reading commands file:', error);
    return [];
  }
}

/**
 * Parses the commands.js file content to extract command definitions
 * Looks for command objects with name, description, and options
 */
function parseCommands(fileContent) {
  const commands = [];
  
  // Pattern to match entire command definitions including options
  // Need to match multiline blocks, so we use a more complex approach
  const lines = fileContent.split('\n');
  let inCommand = false;
  let commandBuffer = '';
  let commandVarName = '';
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is the start of a command definition
    const commandStartMatch = line.match(/const\s+(\w+_COMMAND)\s*=\s*\{/);
    if (commandStartMatch) {
      inCommand = true;
      commandVarName = commandStartMatch[1];
      commandBuffer = line + '\n';
      braceCount = 1;
      continue;
    }
    
    if (inCommand) {
      commandBuffer += line + '\n';
      
      // Count braces to know when command definition ends
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;
      
      if (braceCount === 0) {
        // Command definition complete, parse it
        const commandData = parseCommandDefinition(commandBuffer, commandVarName, fileContent);
        if (commandData) {
          commands.push(commandData);
        }
        
        inCommand = false;
        commandBuffer = '';
        commandVarName = '';
      }
    }
  }
  
  return commands;
}

/**
 * Parses a single command definition block
 */
function parseCommandDefinition(commandBlock, commandVarName, fileContent) {
  // Extract name
  const nameMatch = commandBlock.match(/name:\s*["']([^"']+)["']/);
  if (!nameMatch) return null;
  
  // Extract description
  const descMatch = commandBlock.match(/description:\s*["']([^"']+)["']/);
  if (!descMatch) return null;
  
  const name = nameMatch[1];
  const description = descMatch[1];
  
  // Check if command is active
  const isActive = checkIfCommandIsActive(fileContent, commandVarName);
  
  // Extract options/parameters
  const options = parseOptions(commandBlock);
  
  return {
    name,
    description,
    active: isActive,
    options: options
  };
}

/**
 * Parses options array from command definition
 */
function parseOptions(commandBlock) {
  const options = [];
  
  // Check if command has options
  const optionsMatch = commandBlock.match(/options:\s*\[([\s\S]*?)\]/);
  if (!optionsMatch) {
    return options;
  }
  
  const optionsContent = optionsMatch[1];
  
  // Split by closing brace followed by comma (option separator)
  const optionBlocks = optionsContent.split(/\},\s*\{/);
  
  for (let block of optionBlocks) {
    // Clean up the block
    block = block.replace(/^\{/, '').replace(/\}$/, '').trim();
    
    if (!block) continue;
    
    // Extract option properties
    const typeMatch = block.match(/type:\s*(\d+)/);
    const nameMatch = block.match(/name:\s*["']([^"']+)["']/);
    const descMatch = block.match(/description:\s*["']([^"']+)["']/);
    const requiredMatch = block.match(/required:\s*(true|false)/);
    
    if (nameMatch && descMatch) {
      const option = {
        name: nameMatch[1],
        description: descMatch[1],
        type: typeMatch ? parseInt(typeMatch[1]) : 3,
        required: requiredMatch ? requiredMatch[1] === 'true' : false
      };
      
      options.push(option);
    }
  }
  
  return options;
}

/**
 * Checks if a command is active (included in ALL_COMMANDS array)
 * Returns false if the command is commented out
 */
function checkIfCommandIsActive(fileContent, commandVarName) {
  // Find the ALL_COMMANDS array
  const allCommandsPattern = /const\s+ALL_COMMANDS\s*=\s*\[([^\]]+)\]/;
  const match = fileContent.match(allCommandsPattern);
  
  if (!match) {
    return false;
  }
  
  const arrayContent = match[1];
  
  // Check if the command variable is in the array and not commented out
  const commandRegex = new RegExp(`^\\s*${commandVarName}\\s*,?\\s*$`, 'm');
  const commentedRegex = new RegExp(`^\\s*//\\s*${commandVarName}\\s*,?\\s*$`, 'm');
  
  // If it's commented out, it's not active
  if (commentedRegex.test(arrayContent)) {
    return false;
  }
  
  // If it's in the array (not commented), it's active
  return commandRegex.test(arrayContent);
}

/**
 * Gets detailed command information including options/parameters
 * This provides more complete data than just name and description
 */
export function getDetailedCommandInfo(fileContent, commandName) {
  const pattern = new RegExp(`const\\s+\\w+_COMMAND\\s*=\\s*\\{[^}]*name:\\s*["']${commandName}["'][^}]*\\}`, 's');
  const match = fileContent.match(pattern);
  
  if (!match) {
    return null;
  }
  
  const commandBlock = match[0];
  
  // Extract options if present
  const hasOptions = /options:\s*\[/.test(commandBlock);
  
  return {
    hasOptions,
    // Can add more detailed parsing here if needed
  };
}
