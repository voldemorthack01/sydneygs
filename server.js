require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const winston = require('winston');

// Setup Logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Proxy (Required for Render/Heroku/Nginx)
// This ensures 'secure' cookies work behind a load balancer
app.set('trust proxy', 1);

// Security & Performance Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for current simple inline scripts if any; ideally remove
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  }
}));
app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.SELF_URL : '*', // Lock down in prod
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // strict limit for login/submit
  message: 'Too many attempts, please try again later.'
});

// Session Management
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_do_not_use_in_prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in prod (requires https)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Database Setup
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbPath = path.join(dataDir, 'submissions.db');
const db = new Database(dbPath, { verbose: msg => logger.debug(msg) });

// Initialize DB
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

// Routes

// 1. Submit Form
app.post('/api/submit',
  sensitiveLimiter,
  [
    body('full_name').trim().notEmpty().withMessage('Name is required').escape(),
    body('phone').trim().notEmpty().withMessage('Phone is required').escape(),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required').escape()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { full_name, phone, email, message } = req.body;

    try {
      const stmt = db.prepare('INSERT INTO submissions (full_name, phone, email, message) VALUES (?, ?, ?, ?)');
      stmt.run(full_name, phone, email || null, message);
      logger.info(`Submission received from ${full_name}`);
      res.json({ success: true, message: 'Quote request received successfully' });
    } catch (error) {
      logger.error('Database insert error', { error: error.message });
      res.status(500).json({ success: false, message: 'Server error processing submission' });
    }
  }
);

// 2. Admin Login
app.post('/api/admin/login',
  sensitiveLimiter,
  [
    body('username').trim().notEmpty(),
    body('password').trim().notEmpty()
  ],
  async (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME;
    const adminHash = process.env.ADMIN_PASSWORD_HASH;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Missing credentials' });
    }

    // Timing-safe comparison (simulated by always doing bcrypt compare if user matches or dummy compare)
    // Simple version:
    if (username === adminUser) {
      const match = await bcrypt.compare(password, adminHash);
      if (match) {
        req.session.admin = true;
        req.session.user = username;
        logger.info(`Admin logged in: ${username}`);
        return res.json({ success: true });
      }
    }

    logger.warn(`Failed login attempt for user: ${username}`);
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
);

// 3. Check Auth Status
app.get('/api/admin/check-auth', (req, res) => {
  res.json({ authenticated: !!req.session.admin });
});

// 4. Logout
app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// 5. Get Submissions (Protected)
app.get('/api/admin/submissions', (req, res) => {
  if (!req.session.admin) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const stmt = db.prepare('SELECT full_name, phone, email, message, submitted_at FROM submissions ORDER BY submitted_at DESC');
    const submissions = stmt.all();
    res.json({ success: true, data: submissions });
  } catch (error) {
    logger.error('Database select error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error fetching data' });
  }
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d', // Cache for 1 day
  etag: true
}));

// Self Ping (for keeping alive if needed, logic preserved but configurable)
const https = require('https');
const http = require('http');
const SELF_URL = process.env.SELF_URL;

if (SELF_URL && SELF_URL.startsWith('http')) {
  function pingSelf() {
    const protocol = SELF_URL.startsWith('https') ? https : http;
    protocol.get(SELF_URL, (res) => {
      // Quiet log or just debug
      logger.debug(`Self-ping status: ${res.statusCode}`);
    }).on('error', (e) => {
      logger.error('Self-ping error', { error: e.message });
    });
  }
  // Schedule ping every 60 mins
  setInterval(pingSelf, 60 * 60 * 1000);
}

// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html')); // Assuming we will create this
});

// 500 Handler (Global Error)
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).sendFile(path.join(__dirname, 'public', '500.html')); // Assuming we will create this
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
