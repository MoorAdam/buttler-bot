#!/bin/bash

# Configuration Frontend Startup Script
# Starts both backend and frontend servers

echo "🚀 Starting Configuration Frontend..."
echo ""

# Start backend on port 3001
echo "📊 Starting Backend API (port 3001)..."
cd "$(dirname "$0")/backend"
unset NODE_ENV
npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend on port 3000
echo "🎨 Starting Frontend UI (port 3000)..."
cd "$(dirname "$0")/frontend"
unset NODE_ENV
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Services started!"
echo ""
echo "Backend API:  http://localhost:3001"
echo "Frontend UI:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# Keep script running
wait
