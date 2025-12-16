# Sydney Gold Star Group - Website (v2)

Professional painting services website for Sydney Gold Star Group. Features a gallery, contact form, and admin dashboard for quote management.

![Sydney GS Logo](public/images/Logos/Logo.png)
*(Note: Screenshot/Logo placeholder)*

## 🚀 Features
- **Responsive Design**: Modern, mobile-friendly interface.
- **Quote Submission**: Secure contact form with validation.
- **Admin Dashboard**: Secure login to view and manage leads.
- **SEO Optimized**: Meta tags, Open Graph, Sitemap, and formatted URLs.
- **Secure**: Helmet headers, Rate Limiting, Bcrypt hashing, HttpOnly cookies.
- **Performant**: Gzip compression, static caching, and optimized assets.

## 📂 File Structure
```
.
├── data/               # SQLite database & storage
├── public/             # Static assets (HTML, CSS, JS, Images)
├── tests/              # Integration tests
├── .env                # Environment variables (Sensitive)
├── server.js           # Main Express application
├── package.json        # Dependencies & Scripts
└── README.md           # This file
```

## 🛠 Tech Stack
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: SQLite (via `better-sqlite3`)
- **Frontend**: Vanilla HTML5, CSS3, JavaScript
- **Security**: Helmet, Bcrypt, Express-Rate-Limit
- **Testing**: Jest, Supertest

## ⚡ Setup & Installation

### Prerequisites
- Node.js installed (v16 or higher) -> [Download](https://nodejs.org/)
- Git (optional)

### 1. Install Dependencies
Open a terminal in the project folder:
```powershell
npm install
```

### 2. Configure Environment
A `.env` file is used for **local development**. A template is provided in `.env.example`.

**Local Setup (`.env`):**
```ini
PORT=3000
ADMIN_USERNAME=replace_with_admin_username
ADMIN_PASSWORD_HASH=$2b$10$...  # (Use generate-hash.js to create)
SESSION_SECRET=local_dev_secret
NODE_ENV=development
SELF_URL=http://localhost:3000/
```

**Production Setup (Render/Server):**
Do not upload `.env`. Instead, set these in your host's "Environment Variables" settings:
- `NODE_ENV`: `production`
- `SELF_URL`: `https://www.sydneygs.com/`
- `ADMIN_USERNAME`: `Admin`
- `ADMIN_PASSWORD_HASH`: (Your generated hash)
- `SESSION_SECRET`: (A long random string)

> **Note**: `.env.example` is a safe template to see what variables are required. `.env` contains your actual local secrets and is ignored by git.

### 3. Run the Application
- **Development** (Auto-restart):
  ```powershell
  npm run dev
  ```
- **Production**:
  ```powershell
  npm start
  ```
- **Test**:
  ```powershell
  npm test
  ```

Visit `http://localhost:3000` to view the site.

## 🔒 Security & Admin Access
The admin panel is at `/admin.html`.
- **Default User**: `replace_with_admin_username`
- **Default Password**: (As configured. Hashed in `.env`) -> *See internal notes for plain password.*

**Security Measures Implemented:**
- **Credentials**: Passwords are hashed (Bcrypt). No plaintext storage.
- **Headers**: `Helmet` secures HTTP headers (CSP, X-Frame-Options).
- **Rate Limiting**: Limits repeated requests to prevent abuse.
- **Validation**: All inputs are sanitized server-side.
- **CSRF/Auth**: Authentication uses secure HttpOnly cookies.

## 📊 Database
The SQLite database is auto-created at `data/submissions.db`.
**Schema:** `submissions (id, full_name, phone, email, message, submitted_at)`

## 🌐 Deployment
1. **Server**: Use a VPS (DigitalOcean, AWS) or Node host (Heroku, Render).
2. **Reverse Proxy (Nginx)**: Recommended for SSL/TLS termination.
   ```nginx
   server {
       listen 80;
       server_name sydneygs.com;
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           # ... standard proxy headers
       }
   }
   ```
3. **SSL**: Use Certbot (Let's Encrypt) for HTTPS.
4. **Environment**: Set `NODE_ENV=production` and `SELF_URL=https://sydneygs.com/`.

## 🤝 Troubleshooting
- **`npm install` fails**: Ensure Node.js is installed. Try deleting `node_modules` and `package-lock.json` and re-running.
- **"Address in use"**: Check if another instance is running on port 3000.
- **Login fails**: Verify `.env` hash matches the password. Use `generate_hash.js` snippet to make a new one if needed.

## 📜 License
ISC License. Copyright © 2025 Sydney Gold Star Group.
