# Buttler Bot Documentation

A Discord bot built on Express.js that handles interactive commands and integrates with n8n workflows for AI-powered explanations.

**Last Updated:** 2025-11-06  
**Node Version:** >=18.x  
**License:** MIT

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Commands](#commands)
5. [File Structure](#file-structure)
6. [Core Components](#core-components)
7. [n8n Integration](#n8n-integration)
8. [Development Guidelines](#development-guidelines)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Buttler Bot is a Discord application that provides:
- **Interactive Commands**: Slash commands with button and select menu interactions
- **AI Explanations**: Integrated with n8n workflows to provide AI-generated explanations via webhooks
- **Rock-Paper-Scissors Game**: A multi-player game with extended rules (rock, paper, scissors, cowboy, virus, computer, wumpus)
- **Browser Automation**: Chrome DevTools MCP integration for testing and debugging

### Key Features

- ✅ Uses minimal external dependencies (only essential Discord and Express libraries)
- ✅ Deferred reply system to handle long-running operations (up to 15 minutes)
- ✅ Webhook integration with n8n for AI processing
- ✅ Component-based interactions (buttons, select menus)
- ✅ Context-aware (works in DMs, group DMs, and servers)

---

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Discord   │────────▶│  Express.js  │────────▶│     n8n     │
│   Client    │◀────────│     App      │◀────────│  Workflow   │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              │
                        ┌─────▼──────┐
                        │  Discord   │
                        │    API     │
                        └────────────┘
```

### Request Flow

1. **User triggers command** in Discord
2. **Discord sends interaction** to `/interactions` endpoint
3. **Express app verifies** the request using Discord's public key
4. **Bot processes** the interaction:
   - For quick responses: Returns immediately
   - For long operations: Defers reply, processes, then edits response
5. **For AI explanations**: Sends webhook request to n8n workflow
6. **n8n processes** the request with AI model
7. **Bot receives response** and updates Discord message

---

## Setup & Installation

### Prerequisites

- Node.js >=18.x
- npm
- Discord Developer Account
- ngrok (for local development)
- n8n instance (optional, for explain command)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd buttler-bot
npm install
```

### Step 2: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Navigate to "Bot" section and create a bot
4. Enable these permissions:
   - `applications.commands`
   - `bot` (with Send Messages)
5. Copy these credentials:
   - Application ID (General Information tab)
   - Bot Token (Bot tab)
   - Public Key (General Information tab)

### Step 3: Configure Environment

Create a `.env` file based on `.env.sample`:

```bash
cp .env.sample .env
```

Edit `.env` with your credentials:

```env
APP_ID=<your_discord_app_id>
DISCORD_TOKEN=<your_bot_token>
PUBLIC_KEY=<your_public_key>
EXPLAIN_WEBHOOK_URL=<your_n8n_webhook_url>
```

### Step 4: Register Commands

This uploads your slash commands to Discord:

```bash
npm run register
```

### Step 5: Start the Bot

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

### Step 6: Setup Interactivity (Local Development)

1. Start ngrok:
   ```bash
   ngrok http 3000
   ```

2. Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`)

3. Go to Discord Developer Portal → Your App → General Information

4. Set "Interactions Endpoint URL" to: `https://abc123.ngrok.io/interactions`

5. Click "Save Changes"

---

## Commands

### `/test`

A simple test command that returns "hello world" with a random emoji.

**Usage:** `/test`

**Implementation:** `app.js` lines 48-63

**Response Time:** Immediate

---

### `/explain <topic>`

Sends a topic to an n8n workflow for AI-powered explanation. Uses deferred replies to handle processing time.

**Usage:** `/explain <topic>`

**Parameters:**
- `topic` (string, required): The concept or topic you want explained

**Example:**
```
/explain quantum computing
/explain the doctor
```

**Implementation:** `app.js` lines 108-174

**Response Time:** Up to 10 seconds (configurable timeout)

**Features:**
- Shows "Bot is thinking..." message immediately
- Waits up to 10 seconds for n8n response
- Updates message with AI-generated explanation
- Handles errors gracefully

**n8n Webhook Payload:**
```json
{
  "topic": "string",
  "DiscordUser": "user_id",
  "channelId": "channel_id",
  "username": "username",
  "timestamp": "2025-11-06T13:25:31.496Z"
}
```

**Expected Response Format:**
```json
{
  "choices": [
    {
      "message": {
        "content": "AI explanation text here"
      }
    }
  ]
}
```

Alternative supported formats:
- `{ "message": { "content": "..." } }`
- `{ "content": "..." }`

---

### `/challenge` (Currently Disabled)

A rock-paper-scissors game with extended rules. Currently commented out but fully functional.

**To Enable:**
1. Uncomment `CHALLENGE_COMMAND` in `commands.js`
2. Add it to `ALL_COMMANDS` array
3. Run `npm run register`

**Gameplay Flow:**
1. Player 1 uses `/challenge <choice>`
2. Bot posts challenge message with "Accept" button
3. Player 2 clicks "Accept"
4. Player 2 sees ephemeral select menu
5. Player 2 makes choice
6. Bot calculates winner and announces result

**Game Rules:**

| Choice    | Beats                            | Beaten By                       |
|-----------|----------------------------------|---------------------------------|
| Rock      | Scissors, Computer, Virus        | Paper, Cowboy, Wumpus          |
| Paper     | Rock, Virus, Cowboy              | Scissors, Computer, Wumpus     |
| Scissors  | Paper, Computer, Virus           | Rock, Cowboy                    |
| Cowboy    | Scissors, Wumpus, Rock           | Virus, Computer, Paper         |
| Virus     | Cowboy, Computer, Wumpus         | Rock, Scissors, Paper          |
| Computer  | Cowboy, Paper, Wumpus            | Rock, Scissors, Virus          |
| Wumpus    | Paper, Rock, Scissors            | Cowboy, Virus, Computer        |

---

## File Structure

```
buttler-bot/
├── .github/
│   └── copilot-instructions.md  # GitHub Copilot coding guidelines
├── app.js                        # Main application entry point
├── commands.js                   # Command definitions and registration
├── game.js                       # Rock-paper-scissors game logic
├── utils.js                      # Utility functions (Discord API, emoji)
├── package.json                  # Dependencies and scripts
├── .env                          # Environment variables (not in git)
├── .env.sample                   # Example environment configuration
├── AGENTS.md                     # AI model information
├── DOCUMENTATION.md              # This file
├── README.md                     # Setup guide and quick start
├── Dockerfile                    # Docker containerization
├── docker-compose.yaml           # Docker compose configuration
├── examples/                     # Example code snippets
├── assets/                       # Static assets
└── node_modules/                 # Dependencies (not in git)
```

---

## Core Components

### 1. app.js - Main Application

The Express.js server that handles all Discord interactions.

**Key Sections:**

#### Interaction Verification (lines 26-38)
- Uses `verifyKeyMiddleware` to validate requests from Discord
- Responds to PING requests with PONG

#### Command Handlers (lines 44-178)
- `/test`: Simple test command
- `/explain`: AI explanation with n8n integration
- `/challenge`: Rock-paper-scissors game (commented out)

#### Component Handlers (lines 184-281)
- `accept_button_*`: Handles game challenge acceptance
- `select_choice_*`: Handles player choice selection

**Important Patterns:**

```javascript
// Deferred reply for long operations
res.send({
  type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
});

// Later, edit the deferred message
const endpoint = `webhooks/${APP_ID}/${token}/messages/@original`;
await DiscordRequest(endpoint, {
  method: "PATCH",
  body: { content: "Updated content" }
});
```

---

### 2. commands.js - Command Registration

Defines slash commands and registers them with Discord.

**Command Structure:**

```javascript
const COMMAND = {
  name: "command_name",           // Command trigger
  description: "Description text", // Shows in Discord UI
  type: 1,                         // 1 = CHAT_INPUT (slash command)
  integration_types: [0, 1],       // 0 = Guild, 1 = User
  contexts: [0, 1, 2],             // 0 = Guild, 1 = DM, 2 = Group DM
  options: [                       // Command parameters
    {
      type: 3,                     // 3 = STRING
      name: "parameter_name",
      description: "Parameter description",
      required: true               // Is this parameter required?
    }
  ]
};
```

**Command Types:**
- `1`: CHAT_INPUT (slash commands)
- `2`: USER (context menu on users)
- `3`: MESSAGE (context menu on messages)

**Option Types:**
- `3`: STRING
- `4`: INTEGER
- `5`: BOOLEAN
- `6`: USER
- `7`: CHANNEL
- `8`: ROLE

---

### 3. game.js - Game Logic

Contains rock-paper-scissors game logic with extended rules.

**Key Functions:**

#### `getResult(player1, player2)`
Calculates the winner of a match.

**Parameters:**
- `player1`: `{ id: "user_id", objectName: "rock" }`
- `player2`: `{ id: "user_id", objectName: "scissors" }`

**Returns:** Formatted result string

**Example:**
```javascript
getResult(
  { id: "123", objectName: "rock" },
  { id: "456", objectName: "scissors" }
);
// Returns: "<@123>'s **rock** crushes <@456>'s **scissors**"
```

#### `getRPSChoices()`
Returns array of all available choices: `["rock", "paper", "scissors", "cowboy", "virus", "computer", "wumpus"]`

#### `getShuffledOptions()`
Returns shuffled options formatted for Discord select menus.

---

### 4. utils.js - Utility Functions

Helper functions for Discord API interactions.

#### `DiscordRequest(endpoint, options)`
Makes authenticated requests to Discord API.

**Parameters:**
- `endpoint`: API endpoint (e.g., `"channels/123/messages"`)
- `options`: Fetch options (method, body, etc.)

**Example:**
```javascript
await DiscordRequest("channels/123/messages", {
  method: "POST",
  body: { content: "Hello!" }
});
```

#### `InstallGlobalCommands(appId, commands)`
Registers slash commands globally.

**Called by:** `commands.js` when you run `npm run register`

#### `getRandomEmoji()`
Returns a random emoji from a predefined list.

#### `capitalize(str)`
Capitalizes the first letter of a string.

---

## n8n Integration

### Overview

The `/explain` command integrates with n8n workflows to provide AI-powered explanations.

### Setup n8n Workflow

1. **Create Webhook Node**
   - Set method to `POST`
   - Copy webhook URL

2. **Add AI Node** (OpenAI, Anthropic, etc.)
   - Configure with your API key
   - Set prompt to use `{{ $json.topic }}`

3. **Add Response Node**
   - Return JSON in this format:
   ```json
   {
     "choices": [
       {
         "message": {
           "content": "{{ $json.ai_response }}"
         }
       }
     ]
   }
   ```

4. **Activate Workflow**

5. **Add Webhook URL to .env**
   ```env
   EXPLAIN_WEBHOOK_URL=https://your-n8n-instance.com/webhook/...
   ```

### Request Format

The bot sends this payload to your webhook:

```json
{
  "topic": "the topic user asked about",
  "DiscordUser": "discord_user_id",
  "channelId": "discord_channel_id",
  "username": "username",
  "timestamp": "2025-11-06T13:25:31.496Z"
}
```

### Response Format

n8n should return JSON in one of these formats:

**Format 1 (OpenAI-style):**
```json
{
  "choices": [
    {
      "message": {
        "content": "The explanation text..."
      }
    }
  ]
}
```

**Format 2 (Simple):**
```json
{
  "message": {
    "content": "The explanation text..."
  }
}
```

**Format 3 (Direct):**
```json
{
  "content": "The explanation text..."
}
```

### Timeout Configuration

The bot waits **10 seconds** for a response. To change this:

Edit `app.js` line 140:
```javascript
signal: AbortSignal.timeout(10000), // Change 10000 to desired milliseconds
```

---

## Development Guidelines

### Code Style

Based on `.github/copilot-instructions.md`:

1. **Minimal Dependencies**
   - Avoid npm libraries if not needed
   - Use built-in Node.js modules when possible

2. **English Language**
   - All code, comments, and documentation in English

3. **n8n Compatibility**
   - Design with webhook integration in mind
   - Support both synchronous and asynchronous workflows

4. **Documentation**
   - Comment every major step
   - Explain non-obvious behavior
   - Use clear variable names

5. **Simplicity**
   - Keep code readable and maintainable
   - Avoid over-engineering
   - Use straightforward patterns

### Adding New Commands

1. **Define command in `commands.js`:**
   ```javascript
   const NEW_COMMAND = {
     name: "command_name",
     description: "What it does",
     type: 1,
     integration_types: [0, 1],
     contexts: [0, 1, 2],
     options: [/* parameters */]
   };
   ```

2. **Add to ALL_COMMANDS array:**
   ```javascript
   const ALL_COMMANDS = [
     TEST_COMMAND,
     EXPLAIN_COMMAND,
     NEW_COMMAND  // Add here
   ];
   ```

3. **Register command:**
   ```bash
   npm run register
   ```

4. **Add handler in `app.js`:**
   ```javascript
   if (name === "command_name") {
     // Your logic here
     return res.send({
       type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
       data: {
         content: "Response text"
       }
     });
   }
   ```

### Handling Long Operations

For operations that take longer than 3 seconds, use deferred replies:

```javascript
// Step 1: Defer immediately
res.send({
  type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
});

// Step 2: Do your processing
const result = await someSlowOperation();

// Step 3: Edit the deferred message
const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;
await DiscordRequest(endpoint, {
  method: "PATCH",
  body: {
    content: result
  }
});
```

**Important:** You have **up to 15 minutes** after deferring to send the final response.

### Adding Interactive Components

**Buttons:**
```javascript
{
  type: MessageComponentTypes.ACTION_ROW,
  components: [
    {
      type: MessageComponentTypes.BUTTON,
      custom_id: "unique_button_id",
      label: "Click Me",
      style: ButtonStyleTypes.PRIMARY
    }
  ]
}
```

**Select Menus:**
```javascript
{
  type: MessageComponentTypes.ACTION_ROW,
  components: [
    {
      type: MessageComponentTypes.STRING_SELECT,
      custom_id: "unique_select_id",
      options: [
        {
          label: "Option 1",
          value: "option_1",
          description: "Description text"
        }
      ]
    }
  ]
}
```

**Handle interactions in `app.js`:**
```javascript
if (type === InteractionType.MESSAGE_COMPONENT) {
  const componentId = data.custom_id;
  
  if (componentId === "unique_button_id") {
    // Handle button click
  }
}
```

---

## Troubleshooting

### "The application did not respond" Error

**Cause:** Discord expects a response within 3 seconds.

**Solution:** Use deferred replies for long operations (see [Handling Long Operations](#handling-long-operations))

---

### Commands not showing in Discord

**Possible Causes:**
1. Commands not registered
2. Bot doesn't have `applications.commands` scope
3. Commands registered in wrong context

**Solutions:**
```bash
# Re-register commands
npm run register

# Check console for errors
# Verify APP_ID in .env is correct
# Re-invite bot with correct scopes
```

---

### Webhook errors with n8n

**Check these:**
1. `EXPLAIN_WEBHOOK_URL` is set in `.env`
2. n8n workflow is activated
3. Webhook is publicly accessible
4. Response format matches expected structure
5. Check console.log output for actual response

**Debug:**
```javascript
// Temporarily add this in app.js line 145
console.log("Webhook response:", JSON.stringify(responseData, null, 2));
```

---

### Bot crashes on startup

**Common Issues:**
1. Missing environment variables
2. Invalid Discord credentials
3. Port already in use

**Check:**
```bash
# Verify .env file exists and has all required variables
cat .env

# Check if port 3000 is available
lsof -i :3000

# Try different port
PORT=3001 npm start
```

---

### Interactive components not working

**Verify:**
1. `custom_id` matches in both creation and handler
2. Handler code exists in `app.js` MESSAGE_COMPONENT section
3. Bot has permission to send messages in that channel
4. Component type is correctly specified

---

## Chrome DevTools MCP

The project includes Chrome DevTools MCP for browser automation and testing.

**Setup:**
```bash
npx chrome-devtools-mcp
```

**Configuration in VS Code (`mcp.json`):**
```json
{
  "servers": {
    "chromedevtools/chrome-devtools-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--browserUrl", "${input:browser_url}",
        "--headless", "${input:headless}",
        "--isolated", "${input:isolated}",
        "--channel", "${input:chrome_channel}"
      ]
    }
  }
}
```

**Use Cases:**
- Test Discord bot UI responses
- Debug web components
- Performance monitoring
- Automated testing

---

## API References

### Discord API
- [Official Documentation](https://discord.com/developers/docs/intro)
- [Interaction Types](https://discord.com/developers/docs/interactions/receiving-and-responding)
- [Message Components](https://discord.com/developers/docs/components)

### Libraries Used
- **express**: Web server framework
- **discord-interactions**: Request verification and types
- **dotenv**: Environment variable management
- **chrome-devtools-mcp**: Browser automation

---

## Contributing

When contributing to this project:

1. Follow the [Development Guidelines](#development-guidelines)
2. Keep dependencies minimal
3. Document all changes
4. Test commands thoroughly
5. Update this documentation if adding features

---

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Discord API documentation
3. Check console logs for errors
4. Verify environment configuration

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2025-11-06  
**Maintained By:** Development Team
