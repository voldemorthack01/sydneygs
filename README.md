# Sydney Gold Star Group Website

Professional painting services website for Sydney Gold Star Group (sydneygs.com).

## Features

- **Home Page**: Hero section, services overview, client reviews
- **Gallery**: Responsive image grid for project showcase
- **Contact/Quote Page**: Lead capture form with SQLite storage
- **Admin Panel**: Private login system for viewing submissions

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Database**: SQLite (better-sqlite3)
- **Styling**: Custom CSS with modern color palette

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

The website will be available at `http://localhost:3000`

### 3. Access Points

- **Home**: `http://localhost:3000/`
- **Gallery**: `http://localhost:3000/gallery.html`
- **Contact**: `http://localhost:3000/contact.html`
- **Admin Panel**: `http://localhost:3000/admin.html`

### Admin Credentials

- **Username**: `username`
- **Password**: `password`

## Project Structure

```
sydneygs-website/
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── contact.js
│   │   └── admin.js
│   ├── images/
│   │   └── logo.png (add your logo here)
│   ├── index.html
│   ├── gallery.html
│   ├── contact.html
│   └── admin.html
├── data/
│   └── submissions.db (created automatically)
├── server.js
├── package.json
└── README.md
```

## Adding Images

### Logo
Place your circular logo (star + Sydney Harbour Bridge) in:
- `public/images/logo.png`

### Gallery Images
Add project images to `public/images/` and update `gallery.html`:
```html
<div class="gallery-item">
    <img src="images/your-image.jpg" alt="Description">
</div>
```

## Database Schema

The SQLite database (`data/submissions.db`) contains one table:

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

## Contact Information

- **Email**: info@sydneygs.com
- **Mobile**: 0493 332 306
- **Domain**: sydneygs.com

## Color Palette

- **Primary**: #2563EB (Blue - reliability)
- **Accent**: #F59E0B (Amber - friendly warmth)
- **Secondary**: #10B981 (Green - quality)
- **Dark**: #1F2937
- **White**: #FFFFFF (dominant)

## Deployment Notes

1. Ensure Node.js is installed on your server
2. Set up environment variables if needed
3. Configure your web server to proxy to Node.js
4. Update social media links in `contact.html`
5. Add your actual logo and project images
6. Consider adding HTTPS for production

## Support

For issues or questions, contact the development team.
