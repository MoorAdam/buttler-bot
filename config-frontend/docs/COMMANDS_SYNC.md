# Commands Sync Feature

## Overview

The frontend automatically stays in sync with the bot's `commands.js` file, displaying all available commands with their descriptions and active status.

## How It Works

### Backend Implementation

**File:** `config-frontend/backend/commands.js`

#### Function: `getCommandsFromFile()`

Reads and parses the bot's commands file to extract command information:

```javascript
const commands = await getCommandsFromFile();
// Returns: [
//   { name: "test", description: "Basic command", active: true },
//   { name: "explain", description: "Explains concepts", active: true },
//   ...
// ]
```

**Process:**
1. Reads `commands.js` from bot root directory
2. Uses regex to find command definitions (e.g., `const TEST_COMMAND = { ... }`)
3. Extracts `name` and `description` properties
4. Checks if command is included in `ALL_COMMANDS` array
5. Returns structured data with active status

#### API Endpoint

**Endpoint:** `GET /api/commands`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "test",
      "description": "Basic command",
      "active": true
    },
    {
      "id": 2,
      "name": "challenge",
      "description": "Challenge to a match of rock paper scissors",
      "active": false
    }
  ]
}
```

### Frontend Implementation

**File:** `config-frontend/frontend/pages/commands.tsx`

The Commands page fetches commands from the API on load:

```typescript
const fetchCommands = async () => {
  const response = await fetch(`${API_URL}/api/commands`);
  const data = await response.json();
  if (data.success) {
    setCommands(data.data);
  }
};
```

**Features:**
- Loading state while fetching
- Error handling with user-friendly messages
- Inactive badge for commented-out commands
- Empty state if no commands found

## Usage

### View Commands

Navigate to: `http://localhost:3002/commands` (or your frontend URL)

The page displays:
- Command name (with `/` prefix)
- Command description
- Yellow "Inactive" badge for commands not in `ALL_COMMANDS`

### Update Commands

Simply edit the bot's `commands.js` file:

1. **Add a new command:**
   ```javascript
   const NEW_COMMAND = {
     name: "newcommand",
     description: "Does something cool",
     type: 1,
     integration_types: [0, 1],
     contexts: [0, 1, 2],
   };
   
   const ALL_COMMANDS = [
     TEST_COMMAND,
     EXPLAIN_COMMAND,
     NEW_COMMAND, // Add here
   ];
   ```

2. **Disable a command:**
   ```javascript
   const ALL_COMMANDS = [
     TEST_COMMAND,
     // CHALLENGE_COMMAND, // Comment out
     EXPLAIN_COMMAND,
   ];
   ```

3. **Refresh the frontend**
   - The commands page will automatically show the changes
   - No need to restart backend or frontend

## Active vs Inactive

**Active Commands:**
- Included in `ALL_COMMANDS` array
- Not commented out
- Displayed normally in frontend

**Inactive Commands:**
- Commented out in `ALL_COMMANDS` array
- Still defined as constants
- Shown with yellow "Inactive" badge

## File Structure

```
config-frontend/
├── backend/
│   ├── commands.js       # Command parsing logic
│   └── server.js         # API endpoint for /api/commands
└── frontend/
    ├── pages/
    │   └── commands.tsx  # Commands display page
    └── styles/
        └── Home.module.css # Styles including .inactiveBadge
```

## Testing

### Test API Directly

```bash
curl http://localhost:3003/api/commands | jq
```

### Test Parsing

The parsing logic handles:
- ✅ Simple commands (no options)
- ✅ Commands with options
- ✅ Commands with choices
- ✅ Commented command definitions
- ✅ Commented entries in ALL_COMMANDS array

## Current Detected Commands

As of last check:
- ✅ **test** - Basic command
- ❌ **challenge** - Challenge to a match of rock paper scissors (Inactive)
- ✅ **explain** - Explains concepts
- ✅ **chucknorris** - Get a random Chuck Norris joke

## Benefits

1. **Always Up-to-Date:** Frontend automatically reflects commands.js changes
2. **No Duplication:** Single source of truth (commands.js)
3. **Visual Feedback:** See which commands are active/inactive
4. **Easy Maintenance:** Update one file, changes appear everywhere
5. **Documentation:** Command descriptions serve as inline documentation

## Future Enhancements

Possible improvements:
- Show command parameters/options
- Display command contexts (guilds, DMs, etc.)
- Show integration types
- Add command usage examples
- Display command type (CHAT_INPUT, USER, MESSAGE)
- Show when commands were last updated
- Add search/filter functionality
