import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path (in backend directory)
const dbPath = join(__dirname, 'config.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Initialize database schema
const initDatabase = () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS parameters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Parameters table ready');
    }
  });
};

// Initialize on import
initDatabase();

// Get all parameters
export const getAllParameters = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM parameters ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Get single parameter by ID
export const getParameterById = (id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM parameters WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

// Create new parameter
export const createParameter = (name, type, value) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO parameters (name, type, value) VALUES (?, ?, ?)';
    db.run(sql, [name, type, value], function(err) {
      if (err) {
        reject(err);
      } else {
        // Return the newly created parameter
        resolve({
          id: this.lastID,
          name,
          type,
          value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });
  });
};

// Update parameter
export const updateParameter = (id, name, type, value) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE parameters 
      SET name = ?, type = ?, value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    db.run(sql, [name, type, value, id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

// Delete parameter
export const deleteParameter = (id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM parameters WHERE id = ?', [id], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
};

// Get parameter by name
export const getParameterByName = (name) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM parameters WHERE name = ?', [name], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export default db;
