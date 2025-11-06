# Commands Documentation

**Detailed documentation for all bot commands and their functionality**

This document covers all commands available in Buttler Bot, their implementation details, usage examples, and integration patterns.

**Last Updated:** 2025-11-06  
**Related Files:** `app.js`, `commands.js`, `game.js`, `utils.js`

---

## Table of Contents

1. [Command Overview](#command-overview)
2. [Active Commands](#active-commands)
   - [/test](#test-command)
   - [/explain](#explain-command)
3. [Disabled Commands](#disabled-commands)
   - [/challenge](#challenge-command)
4. [Command Implementation Guide](#command-implementation-guide)
5. [n8n Webhook Integration](#n8n-webhook-integration)
6. [Game Mechanics](#game-mechanics)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)

---

## Command Overview

Buttler Bot currently has **2 active commands** and **1 disabled command**:

| Command | Status | Type | Purpose |
|---------|--------|------|---------|
| `/test` | ✅ Active | Simple | Test bot responsiveness |
| `/explain` | ✅ Active | AI-powered | Get AI explanations via n8n |
| `/challenge` | ⏸️ Disabled | Interactive game | Rock-paper-scissors with extended rules |

### Command Registration

Commands are defined in `commands.js` and registered globally via:

```bash
npm run register
```

**Important Notes:**
- Global commands can take up to **1 hour** to propagate
- Updates to existing commands also require re-registration
- Changes to command structure (name, options, description) need full re-registration

---

## Active Commands

### /test Command

**Purpose:** Simple health check command that verifies bot is responding correctly.

#### Usage

```
/test
```

No parameters required.

#### Response

Returns "hello world" with a random emoji.

**Example Response:**
```
hello world 😎
```

#### Implementation Details

**Defined in:** `commands.js` lines 21-27

```javascript
const TEST_COMMAND = {
  name: "test",
  description: "Basic command",
  type: 1,                    // CHAT_INPUT (slash command)
  integration_types: [0, 1],  // Works in guilds and user installs
  contexts: [0, 1, 2],        // Guilds, DMs, and group DMs
};
```

**Handler in:** `app.js` lines 48-63

```javascript
if (name === "test") {
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
      components: [
        {
          type: MessageComponentTypes.TEXT_DISPLAY,
          content: `hello world ${getRandomEmoji()}`,
        },
      ],
    },
  });
}
```

#### Response Time

**Immediate** - Responds within milliseconds.

#### Use Cases

- Verify bot is online and responding
- Test interaction endpoint configuration
- Quick connectivity check
- Development testing

---

### /explain Command

**Purpose:** Sends a topic to an n8n workflow for AI-powered explanation. Designed to integrate with external AI services (OpenAI, Anthropic, etc.) through n8n automation.

#### Usage

```
/explain <topic>
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `topic` | STRING | ✅ Yes | The concept, term, or topic you want explained |

#### Examples

```
/explain quantum computing
/explain the doctor
/explain recursion in programming
/explain photosynthesis
/explain blockchain technology
```

#### Response Flow

1. User invokes `/explain quantum computing`
2. Bot immediately shows **"Bot is thinking..."** message
3. Bot sends request to n8n webhook with topic
4. n8n processes with AI model (up to 10 seconds)
5. Bot updates message with AI-generated explanation

#### Implementation Details

**Defined in:** `commands.js` lines 48-62

```javascript
const EXPLAIN_COMMAND = {
  name: "explain",
  description: "Explains concepts",
  type: 1,
  integration_types: [0, 1],
  options: [
    {
      type: 3,              // STRING type
      name: "topic",
      description: "The topic you want explained",
      required: true,
    }
  ],
  contexts: [0, 1, 2],
};
```

**Handler in:** `app.js` lines 108-174

#### Key Features

**1. Deferred Reply System**

Uses deferred replies to handle processing time without hitting Discord's 3-second timeout:

```javascript
// Immediately defer to show "thinking" state
res.send({
  type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
});
```

**2. Webhook Integration**

Sends structured payload to n8n webhook:

```javascript
const explanationRequest = {
  topic: topic,                    // User's topic
  DiscordUser: userId,             // Discord user ID
  channelId: channelId,            // Channel ID
  username: username,              // Username
  timestamp: new Date().toISOString(), // Request timestamp
};
```

**3. Timeout Protection**

10-second timeout prevents hanging requests:

```javascript
fetch(webhookUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(explanationRequest),
  signal: AbortSignal.timeout(10000), // 10 seconds
});
```

**4. Flexible Response Parsing**

Supports multiple response formats from n8n:

```javascript
const content = responseData?.choices?.[0]?.message?.content  // OpenAI format
  || responseData?.message?.content                           // Simple format
  || responseData?.content                                    // Direct format
  || "No explanation available";                              // Fallback
```

**5. Error Handling**

Gracefully handles errors and updates user:

```javascript
catch (err) {
  console.error("Error calling webhook:", err);
  await DiscordRequest(endpoint, {
    method: "PATCH",
    body: {
      content: "Sorry, there was an error processing your request.",
    },
  });
}
```

#### Response Time

**Up to 10 seconds** - Configurable via timeout parameter.

To adjust timeout, edit line 140 in `app.js`:

```javascript
signal: AbortSignal.timeout(15000), // Change to 15 seconds
```

#### Context Data Sent

The webhook receives comprehensive context:

| Field | Description | Example |
|-------|-------------|---------|
| `topic` | User's query | "quantum computing" |
| `DiscordUser` | Discord user ID | "123456789012345678" |
| `channelId` | Channel ID where invoked | "987654321098765432" |
| `username` | Discord username | "john_doe" |
| `timestamp` | ISO 8601 timestamp | "2025-11-06T13:25:31.496Z" |

#### Use Cases

- Educational explanations
- Quick reference for complex topics
- Concept clarification
- AI-powered knowledge base
- Contextual help system
- Topic summaries

---

## Disabled Commands

### /challenge Command

**Status:** ⏸️ Currently commented out but fully functional

**Purpose:** Interactive rock-paper-scissors game with extended rules (7 choices instead of 3).

#### Why Disabled?

The command is commented out in `commands.js` to simplify the initial bot deployment. It's fully implemented and can be enabled at any time.

#### How to Enable

**Step 1:** Uncomment in `commands.js` (lines 30-45)

```javascript
const CHALLENGE_COMMAND = {
  name: "challenge",
  description: "Challenge to a match of rock paper scissors",
  options: [
    {
      type: 3,
      name: "object",
      description: "Pick your object",
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],  // Note: Only in guilds and group DMs, NOT regular DMs
};
```

**Step 2:** Add to ALL_COMMANDS array (line 67)

```javascript
const ALL_COMMANDS = [
  TEST_COMMAND,
  CHALLENGE_COMMAND,  // Add this line
  EXPLAIN_COMMAND
];
```

**Step 3:** Register commands

```bash
npm run register
```

**Step 4:** Verify handler is active in `app.js`

The handler code (lines 66-106 and 184-278) is already present and active.

#### Usage

```
/challenge <object>
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `object` | CHOICE | ✅ Yes | Your choice (rock, paper, scissors, cowboy, virus, computer, wumpus) |

#### Available Choices

1. **Rock** - sedimentary, igneous, or perhaps even metamorphic
2. **Paper** - versatile and iconic
3. **Scissors** - careful! sharp! edges!!
4. **Cowboy** - yeehaw~
5. **Virus** - genetic mutation, malware, or something inbetween
6. **Computer** - beep boop beep bzzrrhggggg
7. **Wumpus** - the purple Discord fella

#### Game Flow

**Step 1: Challenge Issued**

```
Player 1: /challenge rock
```

Bot posts public message:

```
Rock papers scissors challenge from @Player1
[Accept Button]
```

**Step 2: Challenge Accepted**

Player 2 clicks "Accept" button.

**Step 3: Secret Selection**

Player 2 sees **ephemeral** (private) select menu:

```
What is your object of choice?
[Dropdown with all 7 choices]
```

**Step 4: Result Announced**

Bot announces winner publicly:

```
@Player1's rock crushes @Player2's scissors
```

#### Implementation Details

**Command Definition:** `commands.js` lines 30-45

**Game Logic:** `game.js` - Entire file

**Interaction Handlers:** `app.js` lines 66-106 (initial challenge), 184-278 (button/select handlers)

#### Interactive Components

**1. Accept Button**

```javascript
{
  type: MessageComponentTypes.BUTTON,
  custom_id: `accept_button_${req.body.id}`,  // Game ID embedded
  label: "Accept",
  style: ButtonStyleTypes.PRIMARY,
}
```

**2. Choice Select Menu**

```javascript
{
  type: MessageComponentTypes.STRING_SELECT,
  custom_id: `select_choice_${gameId}`,
  options: getShuffledOptions(),  // Randomized order
}
```

#### Game State Management

Uses in-memory storage for active games:

```javascript
const activeGames = {};

// Store game when challenge issued
activeGames[interactionId] = {
  id: userId,
  objectName: userChoice,
};

// Retrieve and delete when completed
const game = activeGames[gameId];
delete activeGames[gameId];
```

**⚠️ Important:** Game state is stored in memory, so it's lost if the bot restarts. For production, consider using a database.

#### Response Time

**Immediate** - All game interactions respond instantly.

#### Context Restrictions

Unlike other commands, `/challenge` works in:
- ✅ Guilds (servers)
- ✅ Group DMs
- ❌ Regular DMs (1-on-1)

**Reason:** The game requires multiple players to interact.

---

## Game Mechanics

### Win/Lose Logic

The game uses a custom rule matrix defined in `game.js`:

```javascript
const RPSChoices = {
  rock: {
    virus: 'outwaits',
    computer: 'smashes',
    scissors: 'crushes',
  },
  // ... more rules
};
```

### Complete Rule Set

| Choice | Defeats | Defeated By |
|--------|---------|-------------|
| **Rock** | Scissors (crushes), Computer (smashes), Virus (outwaits) | Paper (covers), Cowboy (kicks), Wumpus (paints) |
| **Paper** | Rock (covers), Virus (ignores), Cowboy (papercuts) | Scissors (cuts), Computer (uninstalls), Wumpus (draws on) |
| **Scissors** | Paper (cuts), Computer (cuts cord), Virus (cuts DNA) | Rock (crushes), Cowboy (puts away) |
| **Cowboy** | Scissors (puts away), Wumpus (lassos), Rock (kicks) | Virus (infects), Computer (overwhelms), Paper (papercuts) |
| **Virus** | Cowboy (infects), Computer (corrupts), Wumpus (infects) | Rock (outwaits), Scissors (cuts DNA), Paper (ignores) |
| **Computer** | Cowboy (overwhelms), Paper (uninstalls), Wumpus (deletes) | Rock (smashes), Scissors (cuts cord), Virus (corrupts) |
| **Wumpus** | Paper (draws on), Rock (paints), Scissors (reflects in) | Cowboy (lassos), Virus (infects), Computer (deletes) |

### Calculation Algorithm

**Function:** `getResult(player1, player2)`

**Location:** `game.js` lines 3-28

**Logic:**
1. Check if player1's choice beats player2's choice
2. If yes, player1 wins with specific verb
3. If no, check reverse (player2 vs player1)
4. If neither, it's a tie
5. Format result with Discord mentions and formatting

**Example:**

```javascript
getResult(
  { id: "123456", objectName: "rock" },
  { id: "789012", objectName: "scissors" }
);
// Returns: "<@123456>'s **rock** crushes <@789012>'s **scissors**"
```

### Tie Handling

If both players choose the same object:

```
@Player1 and @Player2 draw with **rock**
```

### Randomized Options

Options are shuffled for each player using Fisher-Yates shuffle:

```javascript
return options.sort(() => Math.random() - 0.5);
```

This prevents pattern recognition and keeps the game fair.

---

## Command Implementation Guide

### Adding a New Command

Follow this systematic approach to add new commands:

#### Step 1: Define Command Structure

Add to `commands.js`:

```javascript
const YOUR_COMMAND = {
  name: "commandname",              // What user types
  description: "What it does",      // Shows in Discord UI
  type: 1,                          // CHAT_INPUT
  integration_types: [0, 1],        // Guild and user installs
  contexts: [0, 1, 2],              // All contexts
  options: [                        // Parameters (optional)
    {
      type: 3,                      // STRING
      name: "param_name",
      description: "Parameter description",
      required: true,
      choices: [                    // Optional: predefined choices
        { name: "Choice 1", value: "choice1" },
        { name: "Choice 2", value: "choice2" },
      ]
    }
  ]
};
```

#### Step 2: Register Command

Add to `ALL_COMMANDS` array:

```javascript
const ALL_COMMANDS = [
  TEST_COMMAND,
  EXPLAIN_COMMAND,
  YOUR_COMMAND,  // Add here
];
```

Run registration:

```bash
npm run register
```

#### Step 3: Create Handler

Add to `app.js` in the APPLICATION_COMMAND section:

```javascript
if (name === "commandname") {
  // Extract parameters
  const param = req.body.data.options?.[0]?.value;
  
  // Simple response
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: `You said: ${param}`
    }
  });
}
```

#### Step 4: Test

1. Restart bot: `npm start`
2. Wait for command to appear (up to 1 hour for global)
3. Test in Discord: `/commandname`
4. Check console logs for errors

### Command Response Patterns

#### Pattern 1: Immediate Response

For operations under 2 seconds:

```javascript
return res.send({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    content: "Response text"
  }
});
```

#### Pattern 2: Deferred Response

For operations over 2 seconds:

```javascript
// Step 1: Defer
res.send({
  type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
});

// Step 2: Process
const result = await slowOperation();

// Step 3: Edit
const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;
await DiscordRequest(endpoint, {
  method: "PATCH",
  body: { content: result }
});
```

#### Pattern 3: Ephemeral (Private) Response

Only visible to user who invoked:

```javascript
return res.send({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    content: "Secret message",
    flags: InteractionResponseFlags.EPHEMERAL
  }
});
```

#### Pattern 4: Response with Components

Include buttons or select menus:

```javascript
return res.send({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
    components: [
      {
        type: MessageComponentTypes.TEXT_DISPLAY,
        content: "Choose an option:"
      },
      {
        type: MessageComponentTypes.ACTION_ROW,
        components: [
          {
            type: MessageComponentTypes.BUTTON,
            custom_id: "button_id",
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

## n8n Webhook Integration

The `/explain` command demonstrates webhook integration with n8n for AI processing.

### Setup n8n Workflow

#### Step 1: Create Webhook Trigger

1. Add **Webhook** node to workflow
2. Set **HTTP Method** to `POST`
3. Set **Response Mode** to `When Last Node Finishes`
4. Copy the webhook URL

#### Step 2: Process Topic

Add processing nodes:

**Option A: OpenAI Node**

1. Add **OpenAI** node
2. Set **Resource** to `Chat`
3. Set **Operation** to `Create`
4. Configure prompt:
   ```
   Explain the following topic: {{ $json.topic }}
   ```

**Option B: Anthropic Node**

1. Add **Anthropic** node
2. Configure similar to OpenAI
3. Use topic from webhook input

**Option C: HTTP Request Node**

For custom AI APIs:

```json
{
  "method": "POST",
  "url": "https://your-ai-api.com/explain",
  "body": {
    "topic": "={{ $json.topic }}"
  }
}
```

#### Step 3: Format Response

Add **Set** node to format output:

**Method 1: OpenAI Format (Recommended)**

```json
{
  "choices": [
    {
      "message": {
        "content": "={{ $json.output }}"
      }
    }
  ]
}
```

**Method 2: Simple Format**

```json
{
  "message": {
    "content": "={{ $json.output }}"
  }
}
```

**Method 3: Direct Format**

```json
{
  "content": "={{ $json.output }}"
}
```

#### Step 4: Return Response

Ensure the last node returns JSON to the webhook.

#### Step 5: Add to Environment

Update `.env`:

```env
EXPLAIN_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
```

### Webhook Request Format

Bot sends this payload:

```json
{
  "topic": "quantum computing",
  "DiscordUser": "123456789012345678",
  "channelId": "987654321098765432",
  "username": "john_doe",
  "timestamp": "2025-11-06T13:25:31.496Z"
}
```

### Using Context Data in n8n

You can use any of these fields in your workflow:

**Example: Log user activity**

```javascript
// In n8n Function node
const { topic, DiscordUser, username, timestamp } = $input.first().json;

console.log(`User ${username} (${DiscordUser}) asked about "${topic}" at ${timestamp}`);

return {
  json: {
    topic,
    user: username
  }
};
```

**Example: User-specific responses**

```javascript
// Check if user is premium
const premiumUsers = ['123456789012345678', '987654321098765432'];
const isPremium = premiumUsers.includes($json.DiscordUser);

// Provide longer response for premium users
const maxLength = isPremium ? 2000 : 500;
```

### Testing Webhooks

**1. Test with curl:**

```bash
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "test topic",
    "DiscordUser": "123456",
    "channelId": "789012",
    "username": "testuser",
    "timestamp": "2025-11-06T10:00:00.000Z"
  }'
```

**2. Test in n8n:**

Use the "Test Workflow" button with sample data.

**3. Test in Discord:**

```
/explain test topic
```

Check console logs for webhook response.

### Error Handling

Common webhook errors:

**Timeout (10 seconds exceeded):**
```
Error calling webhook: TimeoutError
```

**Solution:** Optimize AI processing or increase timeout.

**Invalid response format:**
```
Error: Cannot read property 'content' of undefined
```

**Solution:** Ensure response matches expected format.

**Webhook URL not set:**
```
Error: Invalid URL
```

**Solution:** Add `EXPLAIN_WEBHOOK_URL` to `.env`.

---

## Error Handling

### Command-Level Error Handling

Each command should handle its own errors gracefully:

```javascript
try {
  // Command logic
  const result = await riskyOperation();
  
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: result }
  });
} catch (err) {
  console.error("Command error:", err);
  
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "An error occurred. Please try again.",
      flags: InteractionResponseFlags.EPHEMERAL
    }
  });
}
```

### Deferred Reply Error Handling

For deferred responses:

```javascript
res.send({
  type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
});

try {
  const result = await slowOperation();
  
  await updateMessage(result);
} catch (err) {
  console.error("Error:", err);
  
  // Still update message with error
  await updateMessage("Sorry, an error occurred.");
}
```

### User-Friendly Error Messages

**Bad:**
```
Error: ECONNREFUSED 127.0.0.1:3000
```

**Good:**
```
Sorry, I couldn't process your request. Please try again in a moment.
```

**Best:**
```
Sorry, I couldn't connect to the AI service. Please try again in a moment, or contact support if the issue persists.
```

### Logging Best Practices

**1. Log context:**

```javascript
console.error(`Error in /explain command for user ${userId}:`, err);
```

**2. Log full error object:**

```javascript
console.error("Full error:", JSON.stringify(err, null, 2));
```

**3. Log request data:**

```javascript
console.log("Request data:", {
  type: req.body.type,
  command: req.body.data?.name,
  user: req.body.member?.user?.id || req.body.user?.id
});
```

---

## Best Practices

### 1. Always Respond Within 3 Seconds

Discord requires initial response within 3 seconds:

```javascript
// ✅ Good - defer immediately
res.send({
  type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
});

// ❌ Bad - slow operation before response
const result = await slowApiCall();
res.send({ data: { content: result } });
```

### 2. Use Deferred Replies for External Calls

Any external API call should use deferred replies:

```javascript
// Database queries
// AI API calls
// Webhook requests
// File operations
// Complex calculations
```

### 3. Validate Parameters

Always validate user input:

```javascript
const topic = req.body.data.options?.[0]?.value;

if (!topic || topic.trim() === "") {
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "Please provide a topic to explain.",
      flags: InteractionResponseFlags.EPHEMERAL
    }
  });
}
```

### 4. Handle Edge Cases

Consider unusual scenarios:

```javascript
// User cancels before game starts
// Multiple simultaneous commands
// Bot offline during deferred reply
// Webhook returns unexpected format
```

### 5. Use Ephemeral for Errors

Error messages should be private:

```javascript
return res.send({
  type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
  data: {
    content: "Error: Invalid input",
    flags: InteractionResponseFlags.EPHEMERAL  // Only user sees
  }
});
```

### 6. Clean Up Resources

Remove temporary data after use:

```javascript
// Game state
delete activeGames[gameId];

// Timeouts
clearTimeout(timeoutId);

// Event listeners
removeEventListener();
```

### 7. Document Command Behavior

Add comments explaining non-obvious logic:

```javascript
// Using interaction ID as game ID ensures uniqueness
// and prevents conflicts between simultaneous games
activeGames[req.body.id] = { ... };
```

### 8. Test All Contexts

Test commands in:
- Server channels (public)
- Server channels (private)
- Direct messages
- Group DMs
- Different permission levels

### 9. Provide Helpful Descriptions

Command descriptions show in Discord UI:

```javascript
// ❌ Bad
description: "Explains stuff"

// ✅ Good
description: "Get AI-powered explanations of concepts and topics"
```

### 10. Version Your Responses

Consider versioning for breaking changes:

```javascript
// Store version in response for debugging
const response = {
  content: explanation,
  version: "1.0.0"
};
```

---

## Command Reference Summary

### Quick Reference Table

| Command | Parameters | Response Type | Timeout | Integration |
|---------|-----------|---------------|---------|-------------|
| `/test` | None | Immediate | N/A | None |
| `/explain` | `topic` (string) | Deferred | 10s | n8n webhook |
| `/challenge` | `object` (choice) | Immediate + Interactive | N/A | Game logic |

### File Locations

| Feature | File | Lines |
|---------|------|-------|
| Command definitions | `commands.js` | 21-67 |
| Command handlers | `app.js` | 44-178 |
| Component handlers | `app.js` | 184-281 |
| Game logic | `game.js` | All |
| API utilities | `utils.js` | All |

### Environment Variables

| Variable | Required | Used By | Purpose |
|----------|----------|---------|---------|
| `APP_ID` | ✅ Yes | All | Discord application ID |
| `DISCORD_TOKEN` | ✅ Yes | All | Bot authentication |
| `PUBLIC_KEY` | ✅ Yes | All | Request verification |
| `EXPLAIN_WEBHOOK_URL` | For `/explain` | `/explain` | n8n webhook URL |
| `PORT` | Optional | Server | Server port (default: 3000) |

---

## Next Steps

- Read [BASE-SYSTEM.md](./BASE-SYSTEM.md) for architecture details
- Review [DOCUMENTATION.md](../DOCUMENTATION.md) for complete reference
- Check [README.md](../README.md) for quick setup guide
- Explore `examples/` folder for code samples

---

**Documentation Version:** 1.0.0  
**Last Updated:** 2025-11-06  
**Maintained By:** Development Team
