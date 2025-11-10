# Configuration Frontend

Complete Next.js + Express application for managing bot configuration parameters.

## Quick Start

```bash
cd config-frontend
./start.sh
```

This will start:
- Backend API on http://localhost:3001
- Frontend UI on http://localhost:3000

## Manual Start

### Backend Only
```bash
cd backend
npm install
npm start
```

### Frontend Only  
```bash
cd frontend
npm install
npm run dev
```

**Important:** Do NOT set NODE_ENV environment variable. Next.js handles this automatically.

## Project Structure

```
config-frontend/
├── backend/          # Express + SQLite API
│   ├── server.js     # Express server
│   ├── database.js   # SQLite operations
│   └── config.db     # SQLite database
├── frontend/         # Next.js UI
│   ├── pages/        # Next.js pages
│   └── styles/       # CSS styles
├── start.sh          # Startup script
└── README.md         # This file
```

## Features

✅ **View Parameters** - List all configuration parameters  
✅ **Add New** - Create new parameters with inline editing  
✅ **Edit** - Modify existing parameters  
✅ **Delete** - Remove parameters with confirmation modal  
✅ **Type Support** - text, number, url, key, boolean, email  
✅ **Security** - API keys are masked in display  

## API Endpoints

- `GET /api/parameters` - List all
- `POST /api/parameters` - Create
- `PUT /api/parameters/:id` - Update
- `DELETE /api/parameters/:id` - Delete

## Tech Stack

- **Backend:** Express.js 4.x, SQLite 5.x
- **Frontend:** Next.js 14.x, React 18.x, TypeScript
- **Database:** SQLite (file-based, no external DB required)

## Troubleshooting

### Frontend shows 500 error
- Make sure NODE_ENV is not set
- Run: `unset NODE_ENV && npm run dev` in frontend directory

### Backend not responding
- Check if port 3001 is available
- Check logs in backend terminal

### CORS errors
- Backend already has CORS enabled for all origins
- Frontend is configured to use http://localhost:3001

## Development

The frontend uses:
- React 18.3.1 (compatible with Next.js 14)
- TypeScript with `jsx: "preserve"` (Next.js handles JSX transform)
- Module resolution: "node" (not "bundler")

See `backend/README.md` and `frontend/README.md` for detailed documentation.
