const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs'); // <-- ADD THIS

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure the 'data' folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Database setup
const dbPath = path.join(__dirname, 'data', 'submissions.db');
const db = new Database(dbPath);

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    message TEXT NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// API endpoint for form submission
app.post('/api/submit', (req, res) => {
  const { full_name, phone, email, message } = req.body;

  if (!full_name || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Required fields missing' });
  }

  try {
    const stmt = db.prepare('INSERT INTO submissions (full_name, phone, email, message) VALUES (?, ?, ?, ?)');
    stmt.run(full_name, phone, email || null, message);
    res.json({ success: true, message: 'Submission received' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API endpoint for admin login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'username' && password === 'password') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// API endpoint for admin to get submissions
app.get('/api/admin/submissions', (req, res) => {
  const { auth } = req.headers;

  // Simple auth check (in production, use proper session management)
  if (auth !== 'username:password') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const stmt = db.prepare('SELECT full_name, phone, email, message, submitted_at FROM submissions ORDER BY submitted_at DESC');
    const submissions = stmt.all();
    res.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
