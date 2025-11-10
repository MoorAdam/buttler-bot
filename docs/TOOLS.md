# Tools Documentation

This document provides detailed information about the configuration frontend tool and its backend API system.

## Overview

The configuration frontend is a complete full-stack web application that allows managing bot configuration parameters through a user-friendly interface. It consists of:

- **Backend API**: Express.js server with SQLite database
- **Frontend UI**: Next.js + React + TypeScript web interface
- **Database**: SQLite file-based database for persistent storage

## Architecture

```
config-frontend/
├── backend/              # Express.js API server (Port 3001)
│   ├── server.js        # Main server with REST API endpoints
│   ├── database.js      # SQLite database operations and schema
│   ├── config.db        # SQLite database file (auto-created)
│   └── package.json     # Backend dependencies
├── frontend/            # Next.js web application (Port 3002)
│   ├── pages/          # Next.js pages and API routes
│   │   ├── index.tsx   # Main configuration management UI
│   │   ├── _app.tsx    # Next.js app wrapper
│   │   └── _document.tsx # Next.js document wrapper
│   ├── styles/         # CSS modules for styling
│   └── package.json    # Frontend dependencies
├── start.sh            # Convenience script to start both servers
└── README.md           # Quick start guide
```

## Backend API

### Technology Stack

- **Express.js 4.18.2**: Web framework for REST API
- **SQLite3 5.1.6**: Embedded database
- **CORS**: Cross-Origin Resource Sharing enabled
- **Node.js ES Modules**: Using modern import/export syntax

### Database Schema

The backend uses a single SQLite table called `parameters`:

| Column       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| id          | INTEGER  | Primary key (auto-increment)         |
| name        | TEXT     | Parameter name (unique)              |
| type        | TEXT     | Parameter type (text/number/url/etc) |
| value       | TEXT     | Parameter value                      |
| created_at  | DATETIME | Creation timestamp                   |
| updated_at  | DATETIME | Last update timestamp                |

### API Endpoints

#### GET /api/parameters
Retrieves all configuration parameters.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "test_value",
      "type": "text",
      "value": "Hello World",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/parameters/:id
Retrieves a single parameter by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "test_value",
    "type": "text",
    "value": "Hello World",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/parameters
Creates a new parameter.

**Request Body:**
```json
{
  "name": "api_key",
  "type": "key",
  "value": "sk-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "api_key",
    "type": "key",
    "value": "sk-1234567890",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Validation Rules:**
- `name`, `type`, and `value` are required
- `name` must be unique
- `type` must be one of: `text`, `number`, `url`, `key`, `boolean`, `email`

#### PUT /api/parameters/:id
Updates an existing parameter.

**Request Body:**
```json
{
  "name": "api_key",
  "type": "key",
  "value": "sk-0987654321"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "api_key",
    "type": "key",
    "value": "sk-0987654321",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T01:00:00.000Z"
  }
}
```

#### DELETE /api/parameters/:id
Deletes a parameter by ID.

**Response:**
```json
{
  "success": true,
  "message": "Parameter deleted successfully"
}
```

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation error)
- `404`: Resource not found
- `409`: Conflict (duplicate name)
- `500`: Internal server error

### Database Operations

The `database.js` module exports these functions:

```javascript
// Get all parameters (ordered by creation date, newest first)
getAllParameters()

// Get single parameter by ID
getParameterById(id)

// Get single parameter by name
getParameterByName(name)

// Create new parameter
createParameter(name, type, value)

// Update existing parameter
updateParameter(id, name, type, value)

// Delete parameter
deleteParameter(id)
```

All functions return Promises and use SQLite's callback API wrapped in Promises for async/await support.

## Frontend UI

### Technology Stack

- **Next.js 14.2.33**: React framework with server-side rendering
- **React 18.3.1**: UI component library
- **TypeScript 5.9.3**: Type-safe JavaScript
- **CSS Modules**: Scoped styling

### Features

#### 1. View All Parameters
- Displays all configuration parameters in a table
- Shows name, type, value, and actions for each parameter
- Auto-refreshes after any changes
- Empty state message when no parameters exist

#### 2. Add New Parameter
- Click "+ Add New Parameter" button
- Inline form appears at the top of the table
- Fill in name, select type, enter value
- Click Save to create
- Click Cancel to abort

#### 3. Edit Parameter
- Click "Edit" button on any row
- Row transforms into inline edit form
- Modify any field (name, type, value)
- Click Save to update
- Click Cancel to discard changes

#### 4. Delete Parameter
- Click "Delete" button on any row
- Confirmation modal appears with warning
- Click "Delete" to confirm removal
- Click "Cancel" to abort
- Cannot be undone

#### 5. Security Features
- Parameters with type "key" display as `••••••••`
- Actual values are still stored in database
- Prevents accidental exposure of API keys

#### 6. Type Support
Supported parameter types:
- **text**: General text strings
- **number**: Numeric values
- **url**: URLs and endpoints
- **key**: API keys and secrets (masked display)
- **boolean**: True/false values
- **email**: Email addresses

### Component Structure

#### Main Page (`pages/index.tsx`)

**State Management:**
```typescript
// List of all parameters fetched from API
const [parameters, setParameters] = useState<Parameter[]>([]);

// Loading state during API calls
const [loading, setLoading] = useState(true);

// Error messages from API operations
const [error, setError] = useState('');

// Currently editing row (null when not editing)
const [editingRow, setEditingRow] = useState<EditingRow | null>(null);

// ID of parameter to delete (null when modal closed)
const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);
```

**Key Functions:**
- `fetchParameters()`: Retrieves all parameters from API
- `handleAddNew()`: Initializes new parameter form
- `handleSave()`: Creates or updates parameter
- `handleEdit(param)`: Switches row to edit mode
- `handleDelete(id)`: Deletes parameter after confirmation
- `handleCancel()`: Cancels editing without saving

### Styling

Uses CSS Modules for scoped styling:
- Modern, clean interface with card-based layout
- Responsive design for mobile and desktop
- Color-coded action buttons (blue for edit, red for delete)
- Modal overlay for delete confirmation
- Inline form styling for add/edit operations
- Loading and error state indicators

## Integration with Main Application

The configuration system integrates with the main Discord bot application:

### Usage in app.js

```javascript
import { getParameterByName } from './config-frontend/backend/database.js';

// Example: Test command fetches value from database
if (name === "test") {
  try {
    const param = await getParameterByName('test_value');
    const value = param ? param.value : 'Not found';
    
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Test Value: ${value}`
      }
    });
  } catch (err) {
    console.error('Error fetching test_value:', err);
  }
}
```

### Common Use Cases

1. **Storing API Keys**: Store third-party API keys (OpenAI, webhooks, etc.)
2. **Feature Flags**: Enable/disable bot features dynamically
3. **Configuration Values**: URLs, timeouts, message templates
4. **User Preferences**: Bot behavior settings
5. **Environment-Specific Settings**: Different values per environment

## Running the Tools

### Quick Start (Both Servers)

```bash
cd config-frontend
./start.sh
```

This starts:
- Backend API on `http://localhost:3001`
- Frontend UI on `http://localhost:3002`

### Backend Only

```bash
cd config-frontend/backend
npm install
npm start
```

### Frontend Only

```bash
cd config-frontend/frontend
npm install
npm run dev
```

**Important:** Do NOT set `NODE_ENV` environment variable. Next.js handles this automatically.

### Development Mode

Backend with auto-reload:
```bash
cd config-frontend/backend
npm run dev
```

Frontend with hot reload:
```bash
cd config-frontend/frontend
npm run dev
```

## Environment Variables

### Backend (.env in backend/)
```bash
PORT=3001  # Optional, defaults to 3001
```

### Frontend (.env.local in frontend/)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001  # Backend API URL
```

## Troubleshooting

### Frontend Shows 500 Error
- Ensure `NODE_ENV` is not set manually
- Run: `unset NODE_ENV && npm run dev` in frontend directory
- Check that React version matches Next.js compatibility

### Backend Not Responding
- Check if port 3001 is available: `lsof -i :3001`
- Verify SQLite database was created: `ls config-frontend/backend/config.db`
- Check backend logs for errors

### CORS Errors
- Backend has CORS enabled for all origins by default
- Ensure frontend is using correct API URL
- Check browser console for specific CORS error

### Database Locked
- Only one connection at a time (SQLite limitation)
- Restart backend server if database becomes locked
- Database file: `config-frontend/backend/config.db`

### Cannot Add Parameter
- Verify all required fields are filled
- Check for duplicate parameter names
- Ensure type is one of the valid types
- Check backend logs for validation errors

## Security Considerations

1. **API Keys**: Parameters with type "key" are masked in the UI
2. **No Authentication**: Currently no auth layer (add if exposing publicly)
3. **CORS**: Enabled for all origins (restrict in production)
4. **Input Validation**: Server-side validation on all endpoints
5. **SQLite Injection**: Using parameterized queries to prevent SQL injection
6. **HTTPS**: Use HTTPS in production environments

## Future Enhancements

Potential improvements for the configuration system:

- [ ] Add user authentication and authorization
- [ ] Implement parameter categories/grouping
- [ ] Add search and filter functionality
- [ ] Export/import configuration as JSON
- [ ] Version history and rollback capability
- [ ] Encrypted storage for sensitive values
- [ ] Real-time updates via WebSocket
- [ ] Bulk operations (import multiple parameters)
- [ ] Parameter validation rules
- [ ] Audit log for all changes

## API Client Examples

### JavaScript/Node.js

```javascript
// Fetch all parameters
const response = await fetch('http://localhost:3001/api/parameters');
const data = await response.json();
console.log(data.data);

// Create new parameter
const response = await fetch('http://localhost:3001/api/parameters', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'webhook_url',
    type: 'url',
    value: 'https://example.com/webhook'
  })
});
```

### cURL

```bash
# Get all parameters
curl http://localhost:3001/api/parameters

# Create parameter
curl -X POST http://localhost:3001/api/parameters \
  -H "Content-Type: application/json" \
  -d '{"name":"test","type":"text","value":"hello"}'

# Update parameter
curl -X PUT http://localhost:3001/api/parameters/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"test","type":"text","value":"updated"}'

# Delete parameter
curl -X DELETE http://localhost:3001/api/parameters/1
```

## Related Documentation

- [README.md](../README.md) - Main project documentation
- [config-frontend/README.md](../config-frontend/README.md) - Quick start guide
- [BASE-SYSTEM.md](./BASE-SYSTEM.md) - Core system documentation
- [COMMANDS.md](./COMMANDS.md) - Discord commands documentation
