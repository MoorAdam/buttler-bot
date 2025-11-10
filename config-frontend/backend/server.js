import express from 'express';
import cors from 'cors';
import {
  getAllParameters,
  getParameterById,
  createParameter,
  updateParameter,
  deleteParameter
} from './database.js';
import { getCommandsFromFile } from './commands.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// GET /api/parameters - Get all parameters
app.get('/api/parameters', async (req, res) => {
  try {
    const parameters = await getAllParameters();
    res.json({ success: true, data: parameters });
  } catch (error) {
    console.error('Error fetching parameters:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/parameters/:id - Get single parameter
app.get('/api/parameters/:id', async (req, res) => {
  try {
    const parameter = await getParameterById(req.params.id);
    if (!parameter) {
      return res.status(404).json({ success: false, error: 'Parameter not found' });
    }
    res.json({ success: true, data: parameter });
  } catch (error) {
    console.error('Error fetching parameter:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/parameters - Create new parameter
app.post('/api/parameters', async (req, res) => {
  try {
    const { name, type, value } = req.body;

    // Validation
    if (!name || !type || value === undefined || value === null) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, type, and value are required' 
      });
    }

    // Validate type
    const validTypes = ['text', 'number', 'url', 'key', 'boolean', 'email'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: `Type must be one of: ${validTypes.join(', ')}` 
      });
    }

    const parameter = await createParameter(name, type, value);
    res.status(201).json({ success: true, data: parameter });
  } catch (error) {
    console.error('Error creating parameter:', error);
    // Handle unique constraint violation
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ 
        success: false, 
        error: 'A parameter with this name already exists' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/parameters/:id - Update parameter
app.put('/api/parameters/:id', async (req, res) => {
  try {
    const { name, type, value } = req.body;
    const { id } = req.params;

    // Validation
    if (!name || !type || value === undefined || value === null) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, type, and value are required' 
      });
    }

    // Validate type
    const validTypes = ['text', 'number', 'url', 'key', 'boolean', 'email'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        error: `Type must be one of: ${validTypes.join(', ')}` 
      });
    }

    const result = await updateParameter(id, name, type, value);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Parameter not found' });
    }

    // Fetch and return updated parameter
    const parameter = await getParameterById(id);
    res.json({ success: true, data: parameter });
  } catch (error) {
    console.error('Error updating parameter:', error);
    // Handle unique constraint violation
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ 
        success: false, 
        error: 'A parameter with this name already exists' 
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/parameters/:id - Delete parameterd
app.delete('/api/parameters/:id', async (req, res) => {
  try {
    const result = await deleteParameter(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Parameter not found' });
    }

    res.json({ success: true, message: 'Parameter deleted successfully' });
  } catch (error) {
    console.error('Error deleting parameter:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/commands - Get all commands from bot's commands.js file
app.get('/api/commands', async (req, res) => {
  try {
    const commands = await getCommandsFromFile();
    
    // Add additional information if needed
    const enrichedCommands = commands.map((cmd, index) => ({
      id: index + 1,
      name: cmd.name,
      description: cmd.description,
      active: cmd.active,
      options: cmd.options || []
    }));
    
    res.json({ success: true, data: enrichedCommands });
  } catch (error) {
    console.error('Error fetching commands:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api/parameters`);
});
