# Backend API - Bot Configuration

Express.js backend with SQLite database for managing bot parameters.

## Setup

```bash
cd config-frontend/backend
npm install
npm start
```

Server runs on: `http://localhost:3001`

## API Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T07:38:44.489Z"
}
```

### GET /api/parameters
Get all parameters

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "api_url",
      "type": "url",
      "value": "https://api.example.com",
      "created_at": "2025-11-10 07:38:41",
      "updated_at": "2025-11-10 07:38:41"
    }
  ]
}
```

### POST /api/parameters
Create new parameter

**Request:**
```json
{
  "name": "parameter_name",
  "type": "text|number|url|key|boolean|email",
  "value": "parameter_value"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "parameter_name",
    "type": "text",
    "value": "parameter_value",
    "created_at": "2025-11-10T07:38:41.536Z",
    "updated_at": "2025-11-10T07:38:41.537Z"
  }
}
```

### PUT /api/parameters/:id
Update existing parameter

**Request:**
```json
{
  "name": "updated_name",
  "type": "text",
  "value": "updated_value"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "updated_name",
    "type": "text",
    "value": "updated_value",
    "created_at": "2025-11-10 07:38:41",
    "updated_at": "2025-11-10 07:39:15"
  }
}
```

### DELETE /api/parameters/:id
Delete parameter

**Response:**
```json
{
  "success": true,
  "message": "Parameter deleted successfully"
}
```

## Testing with curl

```bash
# Health check
curl http://localhost:3001/health

# Get all parameters
curl http://localhost:3001/api/parameters

# Create parameter
curl -X POST http://localhost:3001/api/parameters \
  -H "Content-Type: application/json" \
  -d '{"name":"test_param","type":"text","value":"test_value"}'

# Update parameter (ID 1)
curl -X PUT http://localhost:3001/api/parameters/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"test_param","type":"text","value":"updated_value"}'

# Delete parameter (ID 1)
curl -X DELETE http://localhost:3001/api/parameters/1
```

## Valid Parameter Types

- `text` - General text string
- `number` - Numeric value
- `url` - URL/endpoint
- `key` - API key or token
- `boolean` - True/false value
- `email` - Email address

## Database

SQLite database file: `config.db`

Schema:
```sql
CREATE TABLE parameters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Error Responses

All errors return:
```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP status codes:
- `400` - Bad request (validation error)
- `404` - Resource not found
- `409` - Conflict (duplicate name)
- `500` - Server error
