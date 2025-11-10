# Frontend - Bot Configuration UI

Next.js frontend for managing bot parameters with a simple, clean interface.

## Setup

```bash
cd config-frontend/frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Features

### ✅ View Parameters
- List all parameters in a table
- Show name, type, and value
- Mask sensitive data (keys show as ••••••••)
- Empty state when no parameters exist

### ✅ Add New Parameter
- Click "Add New Parameter" button
- Fill in name, select type, and enter value
- Click "Save" to create
- Click "Cancel" to abort

### ✅ Edit Parameter
- Click "Edit" button on any row
- Modify fields inline
- Click "Save" to update
- Click "Cancel" to revert changes

### ✅ Delete Parameter
- Click "Delete" button
- Confirmation modal appears
- Confirm or cancel the deletion
- Parameter is removed from database

## Parameter Types

- **Text** - General text string
- **Number** - Numeric value
- **URL** - Web address or endpoint
- **Key** - API key or token (masked in display)
- **Boolean** - True/false value
- **Email** - Email address

## Configuration

Environment variables (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## UI Features

- **Inline Editing** - Edit directly in the table row
- **Confirmation Modal** - Prevent accidental deletions
- **Error Messages** - Clear feedback on failures
- **Loading States** - Shows when fetching data
- **Responsive Design** - Works on mobile and desktop
- **Disabled Actions** - Can't edit/delete while editing another row

## Tech Stack

- **Next.js** - React framework
- **TypeScript** - Type safety
- **CSS Modules** - Scoped styling
- **No external UI libraries** - Pure CSS implementation

## Development

```bash
# Development server
npm run dev

# Production build
npm run build
npm start
```

## API Integration

Connects to backend API at `http://localhost:3001`:
- `GET /api/parameters` - Fetch all
- `POST /api/parameters` - Create new
- `PUT /api/parameters/:id` - Update existing
- `DELETE /api/parameters/:id` - Delete

## Screenshots

The interface includes:
1. Header with title and description
2. "Add New Parameter" button
3. Table with columns: Name, Type, Value, Actions
4. Inline editing for creating/updating
5. Delete confirmation modal with warning
