# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Sydney Gold Star Group website (sydneygs.com) - A professional painting services business website with lead capture and admin management.

**Tech Stack:**
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (no frameworks)
- **Backend**: Node.js with Express
- **Database**: SQLite (better-sqlite3)

## Development Commands

### Start Server
```powershell
npm start
```
Runs on `http://localhost:3000`

### Install Dependencies
```powershell
npm install
```

### No Linting/Testing
This project has no linting, testing, or build scripts configured.

## Architecture

### Server Architecture (server.js)
The Express server follows a simple monolithic pattern:

1. **Static File Serving**: All files in `public/` are served directly via Express static middleware
2. **Database Initialization**: SQLite DB (`data/submissions.db`) is created on startup with auto-migration
3. **API Routes**: Three REST endpoints for form submission, admin login, and fetching submissions
4. **Authentication**: Basic username/password check (hardcoded credentials) with no session management beyond client-side sessionStorage

**Key Flow:**
- Contact form → `/api/submit` → inserts to `submissions` table
- Admin login → `/api/admin/login` → validates credentials → returns success
- Admin panel → `/api/admin/submissions` → validates auth header → returns all submissions

### Frontend Architecture

**Pages:**
- `index.html` - Home page with hero, services, and reviews
- `gallery.html` - Project image showcase
- `contact.html` - Quote request form
- `admin.html` - Private admin panel

**JavaScript Modules:**
- `contact.js` - Handles form submission via Fetch API with validation
- `admin.js` - Manages login flow, session persistence (sessionStorage), and submission display with HTML escaping for XSS prevention

**CSS Structure:**
- Single monolithic `styles.css` with CSS custom properties (variables) for theming
- Mobile-responsive grid layouts using CSS Grid and flexbox
- Color palette defined in `:root` variables

### Database Schema
```sql
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Key Technical Details

### Authentication
- **Admin credentials** are hardcoded in `server.js` (username: `Amir`, password: `amireli21`)
- Authentication is handled via custom `auth` header containing `username:password`
- sessionStorage stores auth token client-side
- No JWT, sessions, or secure token management

### Security Considerations
- No HTTPS enforcement
- No rate limiting on API endpoints
- No CSRF protection
- XSS prevention via HTML escaping in `admin.js`
- Passwords stored in plain text in code

### API Endpoints
- `POST /api/submit` - Submit contact form (body: `{full_name, phone, email, message}`)
- `POST /api/admin/login` - Admin login (body: `{username, password}`)
- `GET /api/admin/submissions` - Get all submissions (header: `auth: username:password`)

## Color Palette
- Primary: `#2563EB` (Blue)
- Accent: `#F59E0B` (Amber)
- Secondary: `#10B981` (Green)
- Dark: `#1F2937`
- White: `#FFFFFF`

## Common Modifications

### Adding Gallery Images
Place images in `public/images/` and add to `gallery.html`:
```html
<div class="gallery-item">
    <img src="images/your-image.jpg" alt="Description">
</div>
```

### Changing Admin Credentials
Update both locations in `server.js`:
- Line 52: Login endpoint validation
- Line 64: Submissions endpoint auth header check

### Database Queries
Access DB via `better-sqlite3` prepared statements:
```javascript
const stmt = db.prepare('SELECT * FROM submissions WHERE id = ?');
const result = stmt.get(id);
```

## Environment
- Port: `process.env.PORT || 3000`
- Database path: `./data/submissions.db` (auto-created)

## Contact Information
- Email: info@sydneygs.com
- Mobile: 0493 332 306
- Domain: sydneygs.com
