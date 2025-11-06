# Base System Documentation

**How Discord Bots Work**

This document explains the foundational system of how Discord bots function, the architecture of this bot, and how to extend it.

**Last Updated:** 2025-11-06  
**Node Version:** >=18.x  

---

## Table of Contents

1. [Discord Bot Fundamentals](#discord-bot-fundamentals)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Interaction Flow](#interaction-flow)
6. [Request Verification](#request-verification)
7. [Response Types](#response-types)
8. [Deferred Replies](#deferred-replies)
9. [Interactive Components](#interactive-components)
10. [Environment Configuration](#environment-configuration)
11. [Development Workflow](#development-workflow)

---

## Discord Bot Fundamentals

### What is a Discord Bot?

A Discord bot is an automated application that runs on Discord servers. Bots can:
- Respond to user commands (slash commands)
- Send and receive messages
- React to events
- Create interactive components (buttons, select menus)
- Integrate with external services

### How Discord Bots Communicate

Discord bots communicate via the **Discord API** using two main methods:

1. **Webhooks (Interactions Endpoint)** - What this bot uses
   - Discord sends HTTP POST requests to your server
   - Your server responds with actions to take
   - Requires a public URL
   - Best for simple command-response patterns

2. **Gateway (WebSocket)**
   - Maintains persistent connection to Discord
   - Receives real-time events
   - Required for event-driven features (message reactions, user joins, etc.)
   - Not used in this bot

### Interaction Types

Discord sends different types of interactions:

| Type | Value | Description |
|------|-------|-------------|
| PING | 1 | Verification request |
| APPLICATION_COMMAND | 2 | Slash command invoked |
| MESSAGE_COMPONENT | 3 | Button/select menu clicked |
| APPLICATION_COMMAND_AUTOCOMPLETE | 4 | Autocomplete option requested |
| MODAL_SUBMIT | 5 | Modal form submitted |

This bot handles types 1, 2, and 3.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Discord Platform                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP POST (Interactions)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Server                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  verifyKeyMiddleware (Discord Signature Check)       │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Interaction Router                                   │  │
│  │  - PING → PONG                                        │  │
│  │  - APPLICATION_COMMAND → Command Handler             │  │
│  │  - MESSAGE_COMPONENT → Component Handler             │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│           ┌───────────┴───────────┐                         │
│           │                       │                         │
│           ▼                       ▼                         │
│  ┌────────────────┐      ┌────────────────┐               │
│  │ Command Logic  │      │ Component Logic│               │
│  │ - /test        │      │ - Buttons      │               │
│  │ - /explain     │      │ - Select menus │               │
│  │ - /challenge   │      └────────────────┘               │
│  └────────┬───────┘                                         │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────────────┐                               │
│  │  External Integration   │                               │
│  │  - n8n Webhooks         │                               │
│  └─────────────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ Discord API Requests
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Discord API (v10)                         │
│  - Edit messages                                             │
│  - Send follow-ups                                           │
│  - Delete messages                                           │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User triggers interaction** (e.g., `/explain quantum computing`)
2. **Discord verifies** your bot's endpoint is registered
3. **Discord sends POST request** to `https://your-server.com/interactions`
4. **Express receives request** at `/interactions` endpoint
5. **verifyKeyMiddleware** validates Discord's signature using PUBLIC_KEY
6. **Request body is parsed** to extract interaction type and data
7. **Interaction router** determines handler based on type
8. **Handler processes** the command/component logic
9. **Response sent** back to Discord (within 3 seconds)
10. **Discord displays** the response to the user

---

## Project Structure

```
buttler-bot/
├── app.js              # Main Express server and interaction handlers
├── commands.js         # Command definitions and registration
├── game.js             # Game logic (rock-paper-scissors)
├── utils.js            # Helper functions for Discord API
├── package.json        # Dependencies and npm scripts
├── .env                # Environment variables (credentials)
├── .env.sample         # Template for environment setup
├── docs/
│   ├── BASE-SYSTEM.md  # This file
│   └── COMMANDS.md     # Command-specific documentation
├── .github/
│   └── copilot-instructions.md  # Development guidelines
├── AGENTS.md           # AI model information
├── DOCUMENTATION.md    # Legacy combined documentation
└── README.md           # Quick start guide
```

---

## Core Components

### 1. app.js - Main Server

The heart of the bot. An Express.js server that:
- Listens on port 3000 (or PORT environment variable)
- Has one endpoint: `/interactions`
- Verifies all incoming requests
- Routes interactions to appropriate handlers

**Key Code Sections:**

```javascript
// Server setup
const app = express();
const PORT = process.env.PORT || 3000;

// Single endpoint for all Discord interactions
app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),  // Security check
  async function (req, res) {
    // All interaction logic here
  }
);

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
```

### 2. commands.js - Command Registration

Defines what commands are available and registers them with Discord.

**Command Definition Structure:**

```javascript
const COMMAND = {
  name: "command_name",        // What user types: /command_name
  description: "Help text",    // Shows in Discord's UI
  type: 1,                     // 1 = CHAT_INPUT (slash command)
  integration_types: [0, 1],   // Where it works
  contexts: [0, 1, 2],         // Guild, DM, Group DM
  options: []                  // Command parameters
};
```

**Integration Types:**
- `0`: GUILD_INSTALL (bot added to server)
- `1`: USER_INSTALL (bot installed to user account)

**Contexts:**
- `0`: GUILD (server channels)
- `1`: BOT_DM (direct message with bot)
- `2`: PRIVATE_CHANNEL (group DMs)

**Option Types:**

| Type | Name | Description |
|------|------|-------------|
| 3 | STRING | Text input |
| 4 | INTEGER | Whole number |
| 5 | BOOLEAN | True/false |
| 6 | USER | Mention a user |
| 7 | CHANNEL | Select a channel |
| 8 | ROLE | Select a role |
| 10 | NUMBER | Decimal number |

### 3. utils.js - Helper Functions

Provides utilities for interacting with Discord API.

#### `DiscordRequest(endpoint, options)`

Makes authenticated requests to Discord API v10.

**Usage:**
```javascript
await DiscordRequest("channels/123456789/messages", {
  method: "POST",
  body: { content: "Hello from bot!" }
});
```

**Features:**
- Auto-adds bot token to Authorization header
- Stringifies request body
- Throws errors for failed requests
- Returns response object

#### `InstallGlobalCommands(appId, commands)`

Bulk registers commands globally across all servers.

**Usage:**
```javascript
const commands = [TEST_COMMAND, EXPLAIN_COMMAND];
await InstallGlobalCommands(process.env.APP_ID, commands);
```

**Note:** Global commands can take up to 1 hour to propagate. For instant updates during development, use guild-specific commands.

### 4. game.js - Game Logic

Contains the logic for the rock-paper-scissors game. This is independent of Discord and could be used in any JavaScript project.

**Key Function:**
```javascript
getResult(player1, player2)
// player1: { id: "user_id", objectName: "rock" }
// player2: { id: "user_id", objectName: "scissors" }
// Returns: "<@123>'s **rock** crushes <@456>'s **scissors**"
```

---

## Interaction Flow

### PING Interaction (Type 1)

**Purpose:** Discord verifies your endpoint is working.

**When it happens:**
- When you first set up the Interactions Endpoint URL
- Periodically for health checks

**Handler:**
```javascript
if (type === InteractionType.PING) {
  return res.send({ type: InteractionResponseType.PONG });
}
```

**Response:** Simply return PONG (type 1).

---

### Application Command (Type 2)

**Purpose:** User invoked a slash command.

**Request body structure:**
```json
{
  "type": 2,
  "id": "interaction_id",
  "application_id": "your_app_id",
  "token": "interaction_token",
  "data": {
    "name": "command_name",
    "options": [
      {
        "name": "parameter_name",
        "value": "user_input"
      }
    ]
  },
  "member": {
    "user": {
      "id": "user_id",
      "username": "username"
    }
  },
  "channel_id": "channel_id"
}
```

**Handler pattern:**
```javascript
if (type === InteractionType.APPLICATION_COMMAND) {
  const { name } = data;
  
  if (name === "your_command") {
    // Process command
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Response text" }
    });
  }
}
```

---

### Message Component (Type 3)

**Purpose:** User clicked a button or selected from a menu.

**Request body structure:**
```json
{
  "type": 3,
  "data": {
    "custom_id": "button_id_123",
    "component_type": 2
  }
}
```

**Component Types:**
- `2`: BUTTON
- `3`: STRING_SELECT
- `5`: USER_SELECT
- `6`: ROLE_SELECT
- `7`: MENTIONABLE_SELECT
- `8`: CHANNEL_SELECT

**Handler pattern:**
```javascript
if (type === InteractionType.MESSAGE_COMPONENT) {
  const componentId = data.custom_id;
  
  if (componentId.startsWith("button_prefix_")) {
    const id = componentId.replace("button_prefix_", "");
    // Handle button click
  }
}
```

---

## Request Verification

Discord signs every request with your app's public key to prevent unauthorized requests.

### How it Works

1. Discord generates a signature using your PUBLIC_KEY
2. Signature is sent in `X-Signature-Ed25519` header
3. Timestamp is sent in `X-Signature-Timestamp` header
4. `verifyKeyMiddleware` validates the signature
5. If invalid, request is rejected with 401 Unauthorized

### Implementation

```javascript
import { verifyKeyMiddleware } from "discord-interactions";

app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async function (req, res) {
    // Only valid requests reach here
  }
);
```

**Security benefits:**
- Prevents replay attacks
- Ensures requests actually come from Discord
- Protects against malicious requests

---

## Response Types

Discord expects specific response types based on the interaction.

### Response Type Reference

| Type | Value | Description | Use Case |
|------|-------|-------------|----------|
| PONG | 1 | Acknowledge ping | PING interactions |
| CHANNEL_MESSAGE_WITH_SOURCE | 4 | Send message | Immediate command response |
| DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE | 5 | "Bot is thinking..." | Long operations |
| DEFERRED_UPDATE_MESSAGE | 6 | Acknowledge component | Silent button response |
| UPDATE_MESSAGE | 7 | Edit component message | Update button message |

### Immediate Response

For quick operations (< 3 seconds):

```javascript
return res.send({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    content: "Response text",
    flags: InteractionResponseFlags.EPHEMERAL  // Optional: only user sees
  }
});
```

### Components in Response

```javascript
return res.send({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
    components: [
      {
        type: MessageComponentTypes.TEXT_DISPLAY,
        content: "Message text"
      },
      {
        type: MessageComponentTypes.ACTION_ROW,
        components: [
          {
            type: MessageComponentTypes.BUTTON,
            custom_id: "unique_id",
            label: "Click Me",
            style: ButtonStyleTypes.PRIMARY
          }
        ]
      }
    ]
  }
});
```

---

## Deferred Replies

**Problem:** Discord expects a response within **3 seconds**. Long operations (API calls, database queries) may take longer.

**Solution:** Deferred replies give you **up to 15 minutes** to respond.

### How Deferred Replies Work

1. **Immediately** respond with DEFERRED type (within 3 seconds)
2. Discord shows "Bot is thinking..." message
3. **Process** your operation (can take up to 15 minutes)
4. **Edit** the deferred message using webhooks

### Implementation Pattern

```javascript
if (name === "slow_command") {
  // Step 1: Defer immediately
  res.send({
    type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
  });

  // Step 2: Do slow operation
  try {
    const result = await someSlowApiCall();

    // Step 3: Edit the deferred message
    const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;
    await DiscordRequest(endpoint, {
      method: "PATCH",
      body: {
        content: result
      }
    });
  } catch (err) {
    // Step 3b: Error handling - still edit the message
    const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;
    await DiscordRequest(endpoint, {
      method: "PATCH",
      body: {
        content: "An error occurred."
      }
    });
  }
  
  return;  // Important: don't send response again
}
```

### Key Points

- Always defer if operation might take > 2 seconds
- Use interaction token from `req.body.token`
- Edit using `@original` as message ID
- Can edit multiple times within 15 minutes
- Must edit at least once (or message shows error)

---

## Interactive Components

Interactive components create buttons and menus users can interact with.

### Button Styles

| Style | Value | Description | Color |
|-------|-------|-------------|-------|
| PRIMARY | 1 | Main action | Blurple |
| SECONDARY | 2 | Alternative action | Gray |
| SUCCESS | 3 | Positive action | Green |
| DANGER | 4 | Destructive action | Red |
| LINK | 5 | Opens URL | Gray with link |

### Creating Buttons

```javascript
{
  type: MessageComponentTypes.ACTION_ROW,
  components: [
    {
      type: MessageComponentTypes.BUTTON,
      custom_id: "accept_btn",
      label: "Accept",
      style: ButtonStyleTypes.PRIMARY,
      disabled: false  // Optional
    },
    {
      type: MessageComponentTypes.BUTTON,
      custom_id: "decline_btn",
      label: "Decline",
      style: ButtonStyleTypes.DANGER
    }
  ]
}
```

**Limitations:**
- Max 5 buttons per ACTION_ROW
- Max 5 ACTION_ROWs per message
- custom_id max 100 characters

### Creating Select Menus

```javascript
{
  type: MessageComponentTypes.ACTION_ROW,
  components: [
    {
      type: MessageComponentTypes.STRING_SELECT,
      custom_id: "choice_select",
      placeholder: "Choose an option",
      min_values: 1,  // Min selections required
      max_values: 1,  // Max selections allowed
      options: [
        {
          label: "Option 1",
          value: "opt_1",
          description: "Description text",
          emoji: { name: "🎮" },  // Optional
          default: false
        },
        {
          label: "Option 2",
          value: "opt_2",
          description: "Another option"
        }
      ]
    }
  ]
}
```

**Limitations:**
- Max 25 options per select menu
- Only 1 select menu per ACTION_ROW

### Handling Component Interactions

```javascript
if (type === InteractionType.MESSAGE_COMPONENT) {
  const componentId = data.custom_id;
  
  // Button handler
  if (componentId === "accept_btn") {
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "You accepted!" }
    });
  }
  
  // Select menu handler
  if (componentId === "choice_select") {
    const selectedValue = data.values[0];  // Array of selected values
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: `You selected: ${selectedValue}` }
    });
  }
}
```

---

## Environment Configuration

### Required Variables

Create a `.env` file with these variables:

```env
# Discord Application Credentials
APP_ID=your_application_id_here
DISCORD_TOKEN=your_bot_token_here
PUBLIC_KEY=your_public_key_here

# External Integrations (optional)
EXPLAIN_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxx

# Server Configuration (optional)
PORT=3000
```

### Where to Find Credentials

1. **APP_ID** (Application ID)
   - Discord Developer Portal → Your App → General Information
   - Under "Application ID"

2. **DISCORD_TOKEN** (Bot Token)
   - Discord Developer Portal → Your App → Bot
   - Click "Reset Token" or "Copy" if already generated
   - **Never share this publicly!**

3. **PUBLIC_KEY**
   - Discord Developer Portal → Your App → General Information
   - Under "Public Key"

### Security Best Practices

- Never commit `.env` to git (already in `.gitignore`)
- Use `.env.sample` as a template
- Rotate tokens if exposed
- Use different tokens for dev/prod environments

---

## Development Workflow

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.sample .env
   # Edit .env with your credentials
   ```

3. **Register commands:**
   ```bash
   npm run register
   ```

4. **Start development server:**
   ```bash
   npm run dev  # Uses nodemon for auto-reload
   ```

5. **Expose local server (ngrok):**
   ```bash
   ngrok http 3000
   ```

6. **Update Discord Interactions URL:**
   - Copy ngrok HTTPS URL
   - Discord Developer Portal → Your App → General Information
   - Set Interactions Endpoint URL: `https://xxx.ngrok.io/interactions`

### Adding a New Command

1. **Define command in `commands.js`:**
   ```javascript
   const NEW_COMMAND = {
     name: "newcmd",
     description: "Does something cool",
     type: 1,
     integration_types: [0, 1],
     contexts: [0, 1, 2],
     options: [
       {
         type: 3,
         name: "input",
         description: "Some input",
         required: true
       }
     ]
   };
   ```

2. **Add to ALL_COMMANDS:**
   ```javascript
   const ALL_COMMANDS = [
     TEST_COMMAND,
     EXPLAIN_COMMAND,
     NEW_COMMAND  // Add here
   ];
   ```

3. **Register:**
   ```bash
   npm run register
   ```

4. **Add handler in `app.js`:**
   ```javascript
   if (name === "newcmd") {
     const input = req.body.data.options[0].value;
     
     return res.send({
       type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
       data: {
         content: `You entered: ${input}`
       }
     });
   }
   ```

5. **Test in Discord:**
   - Type `/newcmd` in any channel
   - Command should appear in autocomplete

### Testing Workflow

1. **Make code changes**
2. **Server auto-reloads** (if using `npm run dev`)
3. **Test in Discord** immediately
4. **Check console logs** for errors
5. **Iterate quickly**

### Command Update Notes

- **Global commands**: Can take up to 1 hour to update
- **Guild commands**: Update instantly
- For development, use guild-specific commands:
  ```javascript
  const endpoint = `applications/${APP_ID}/guilds/${GUILD_ID}/commands`;
  ```

### Debugging Tips

1. **Check console output:**
   ```javascript
   console.log("Request body:", req.body);
   console.log("Interaction type:", type);
   console.log("Command name:", data.name);
   ```

2. **Test with curl:**
   ```bash
   curl -X POST http://localhost:3000/interactions \
     -H "Content-Type: application/json" \
     -d '{"type":1}'
   ```

3. **Verify ngrok:**
   - Visit `http://127.0.0.1:4040` for ngrok inspector
   - See all requests and responses

4. **Discord Developer Portal:**
   - Check "Recent Activity" for errors
   - View interaction logs

---

## Common Patterns

### Pattern 1: Command with Parameters

```javascript
if (name === "greet") {
  const username = req.body.data.options.find(opt => opt.name === "user").value;
  const greeting = req.body.data.options.find(opt => opt.name === "message")?.value || "Hello";
  
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `${greeting}, <@${username}>!`
    }
  });
}
```

### Pattern 2: Ephemeral Response (Only User Sees)

```javascript
return res.send({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    content: "Secret message only you can see",
    flags: InteractionResponseFlags.EPHEMERAL
  }
});
```

### Pattern 3: Edit Original Message

```javascript
const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;
await DiscordRequest(endpoint, {
  method: "PATCH",
  body: {
    content: "Updated content",
    components: []  // Remove components
  }
});
```

### Pattern 4: Follow-up Message

```javascript
// After deferred or initial response
const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}`;
await DiscordRequest(endpoint, {
  method: "POST",
  body: {
    content: "This is a follow-up message"
  }
});
```

### Pattern 5: Delete Message

```javascript
const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${messageId}`;
await DiscordRequest(endpoint, {
  method: "DELETE"
});
```

---

## Troubleshooting

### "The application did not respond"

**Cause:** No response sent within 3 seconds.

**Solutions:**
- Use deferred replies for slow operations
- Check for errors in console
- Ensure `res.send()` is called
- Verify response structure is correct

### "Invalid signature"

**Cause:** Request verification failed.

**Solutions:**
- Check PUBLIC_KEY in `.env` is correct
- Ensure no spaces/newlines in PUBLIC_KEY
- Verify ngrok URL matches Discord settings
- Check ngrok is running

### Commands not appearing

**Causes:**
- Not registered with Discord
- Bot missing `applications.commands` scope
- Global command propagation delay (up to 1 hour)

**Solutions:**
- Run `npm run register`
- Re-invite bot with correct permissions
- Wait for propagation or use guild commands
- Check console for registration errors

### Components not working

**Issues:**
- custom_id mismatch between creation and handler
- Missing handler in MESSAGE_COMPONENT section
- Component IDs must be unique

**Debug:**
```javascript
console.log("Component ID:", data.custom_id);
console.log("Component type:", data.component_type);
console.log("Values:", data.values);  // For select menus
```

---

## Next Steps

- Read [COMMANDS.md](./COMMANDS.md) for specific command documentation
- Review `.github/copilot-instructions.md` for coding guidelines
- Check Discord's [official documentation](https://discord.com/developers/docs)
- Explore `examples/` folder for additional patterns

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2025-11-06
