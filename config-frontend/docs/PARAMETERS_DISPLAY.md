# Command Parameters Display - Implementation Guide

## Overview

The frontend now displays command parameters (options) with full details including name, type, description, and required status.

## Features Implemented

### 1. Backend Enhancements

**File:** `config-frontend/backend/commands.js`

#### Enhanced Parsing

The parser now extracts complete parameter information from command definitions:

```javascript
// Example command with parameters
const EXPLAIN_COMMAND = {
  name: "explain",
  description: "Explains concepts",
  options: [
    {
      type: 3,              // STRING
      name: "topic",
      description: "The topic you want explained",
      required: true,
    }
  ],
};
```

#### parseOptions() Function

Extracts parameter details:
- **name:** Parameter name
- **description:** What the parameter does
- **type:** Discord option type (1-10)
- **required:** Whether parameter is required

#### API Response Structure

```json
{
  "success": true,
  "data": [
    {
      "id": 3,
      "name": "explain",
      "description": "Explains concepts",
      "active": true,
      "options": [
        {
          "name": "topic",
          "description": "The topic you want explained",
          "type": 3,
          "required": true
        }
      ]
    }
  ]
}
```

### 2. Frontend Display

**File:** `config-frontend/frontend/pages/commands.tsx`

#### TypeScript Interfaces

```typescript
interface CommandOption {
  name: string;
  description: string;
  type: number;
  required: boolean;
}

interface Command {
  id: number;
  name: string;
  description: string;
  active: boolean;
  options?: CommandOption[];
}
```

#### Parameter Type Mapping

```typescript
const DISCORD_OPTION_TYPES = {
  1: "Subcommand",
  2: "Subcommand Group",
  3: "String",
  4: "Integer",
  5: "Boolean",
  6: "User",
  7: "Channel",
  8: "Role",
  9: "Mentionable",
  10: "Number"
};
```

### 3. Visual Design

**File:** `config-frontend/frontend/styles/Home.module.css`

#### Parameter Section Layout

```
┌─────────────────────────────────────┐
│ /explain                            │
│ Explains concepts                   │
│ ─────────────────────────────────── │
│ PARAMETERS:                         │
│ ┌─────────────────────────────────┐ │
│ │ topic [STRING] [REQUIRED]       │ │
│ │ The topic you want explained    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### CSS Classes

- **.parametersSection** - Container with top border separator
- **.parametersTitle** - "PARAMETERS:" heading
- **.parametersList** - Vertical list of parameters
- **.parameter** - Individual parameter card (gray bg, purple left border)
- **.parameterHeader** - Name, type, and required badge row
- **.parameterName** - Parameter name in monospace font
- **.parameterType** - Blue badge showing type (STRING, INTEGER, etc.)
- **.parameterDescription** - Explanation text
- **.requiredBadge** - Red badge for required parameters

#### Color Scheme

- **Purple (#667eea)** - Type badges, accent borders
- **Red (#dc3545)** - Required badges
- **Gray (#f8f9fa)** - Parameter backgrounds
- **Yellow (#ffc107)** - Inactive command badges

## Discord Parameter Types Reference

| Type ID | Name | Description |
|---------|------|-------------|
| 1 | Subcommand | A subcommand |
| 2 | Subcommand Group | A group of subcommands |
| 3 | String | Text input |
| 4 | Integer | Whole number |
| 5 | Boolean | True/false |
| 6 | User | Mention a user |
| 7 | Channel | Select a channel |
| 8 | Role | Select a role |
| 9 | Mentionable | User or role |
| 10 | Number | Decimal number |

## Usage Examples

### Command with Required Parameter

```javascript
const EXPLAIN_COMMAND = {
  name: "explain",
  description: "Explains concepts",
  options: [
    {
      type: 3,
      name: "topic",
      description: "The topic you want explained",
      required: true,
    }
  ],
};
```

**Displays as:**
- Parameter name: `topic`
- Type badge: `STRING` (blue)
- Required badge: `REQUIRED` (red)
- Description: "The topic you want explained"

### Command with Optional Parameter

```javascript
const SEARCH_COMMAND = {
  name: "search",
  description: "Search for something",
  options: [
    {
      type: 3,
      name: "query",
      description: "Search terms",
      required: false,
    }
  ],
};
```

**Displays as:**
- Parameter name: `query`
- Type badge: `STRING` (blue)
- No required badge (optional parameter)
- Description: "Search terms"

### Command with Multiple Parameters

```javascript
const MESSAGE_COMMAND = {
  name: "message",
  description: "Send a message",
  options: [
    {
      type: 6,
      name: "user",
      description: "User to message",
      required: true,
    },
    {
      type: 3,
      name: "text",
      description: "Message text",
      required: true,
    }
  ],
};
```

**Displays as:**
Two parameter cards:
1. `user` [USER] [REQUIRED]
2. `text` [STRING] [REQUIRED]

### Command with No Parameters

```javascript
const TEST_COMMAND = {
  name: "test",
  description: "Basic command",
  // No options property
};
```

**Displays as:**
- Just command name and description
- No parameters section shown

## Testing

### Check API Response

```bash
curl http://localhost:3001/api/commands | jq '.data[] | {
  name: .name,
  params: [.options[]? | {name: .name, type: .type, required: .required}]
}'
```

### Verify Frontend Display

1. Open http://localhost:3002/commands
2. Look for commands with parameters (explain, yes, challenge)
3. Verify parameter details are shown:
   - Name in monospace font
   - Type badge (blue)
   - Required badge if applicable (red)
   - Description text

## Current Commands with Parameters

| Command | Parameter | Type | Required | Description |
|---------|-----------|------|----------|-------------|
| `/explain` | topic | String | Yes | The topic you want explained |
| `/yes` | topic | String | Yes | The topic you want explained |
| `/challenge` | object | String | Yes | Pick your object (inactive) |

## Benefits

1. **Complete Documentation** - Users see exactly what parameters are needed
2. **Type Information** - Clear indication of expected input type
3. **Required vs Optional** - Visual distinction with badges
4. **Auto-Generated** - Syncs directly from commands.js file
5. **Consistent Styling** - Matches the overall design system

## Future Enhancements

Possible improvements:
- Show parameter choices (for dropdown options)
- Display min/max values for numbers
- Show default values
- Add usage examples for each command
- Support for autocomplete options
- Parameter validation rules
- Show command permissions required

## Troubleshooting

### Parameters not showing

**Check:**
1. Command has `options: [...]` array in commands.js
2. Backend is running and updated (restart if needed)
3. Frontend has compiled the changes (check browser console)
4. API returns options: `curl http://localhost:3001/api/commands`

### Type showing as "Type 3" instead of "String"

**Check:**
- DISCORD_OPTION_TYPES mapping includes the type number
- Type is between 1-10 (valid Discord types)

### Required badge not showing

**Check:**
- Parameter has `required: true` in commands.js
- Not just missing (undefined defaults to false)

## Summary

The parameters display provides complete, automatically-synced documentation of all command parameters directly from the bot's code. Users can see:

✓ What parameters are available  
✓ What type of input is expected  
✓ Which parameters are required  
✓ Clear descriptions of each parameter  

All without manual documentation updates!
