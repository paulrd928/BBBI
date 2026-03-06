# BBBI Community Platform

A warm, welcoming web community for Black men affected by brain injury and their caregivers.

## Quick Start

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd /Users/pauldelaney/Desktop/code/BBBI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Visit the app:**
   - Homepage: http://localhost:3000
   - Admin login: http://localhost:3000/admin/login
   - Default credentials: `admin` / `admin123` (change these in `.env`)

### Default Credentials

Edit `.env` to change the default admin credentials:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**Important:** Change these immediately in production!

## Project Structure

```
BBBI/
├── server.js              # Express app entry point
├── package.json           # Dependencies
├── .env                   # Environment variables (keep private!)
├── .env.example           # Template for .env
├── railway.toml           # Railway deployment config
│
├── database/
│   ├── db.js              # SQLite connection & schema initialization
│   ├── schema.sql         # Database tables
│   └── bbbi.db            # SQLite database file (auto-created)
│
├── routes/
│   ├── index.js           # Homepage
│   ├── blog.js            # Blog posts
│   ├── caregivers.js      # Caregiver section
│   ├── signup.js          # Email sign-ups
│   └── admin.js           # Admin dashboard
│
├── middleware/
│   ├── auth.js            # Session authentication
│   └── upload.js          # File upload handling
│
├── views/
│   ├── layout.ejs         # HTML template shell
│   ├── home.ejs           # Homepage
│   ├── blog/              # Blog templates
│   ├── admin/             # Admin templates
│   └── partials/          # Reusable components
│
└── public/
    ├── css/               # Stylesheets
    ├── js/                # Client-side JS
    └── uploads/           # User-uploaded videos
```

## Features

### Public Pages
- **Homepage** (`/`) - Welcome with featured stories and sign-up form
- **Blog** (`/blog`) - All published posts with role badges
- **Individual Post** (`/blog/:slug`) - Full post with embedded video
- **Caregivers** (`/caregivers`) - Caregiver-specific stories

### Admin Features
- **Login** (`/admin/login`) - Username/password authentication
- **Dashboard** (`/admin/dashboard`) - Manage posts and subscribers
- **Create Post** - Write stories with video uploads
- **Publish/Draft Toggle** - Control visibility
- **Export Subscribers** - Download email list as CSV

### Community Features
- **Email Sign-ups** - Collect subscriber info (email, name, role)
- **Video Posts** - Upload MP4/MOV videos from phones (up to 200MB)
- **Role Badges** - Tag posts as Member or Caregiver

## Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Templates:** EJS
- **Database:** SQLite (better-sqlite3)
- **File Uploads:** Multer
- **Sessions:** express-session
- **Auth:** bcrypt (password hashing)
- **Styling:** Custom CSS (no build step needed)

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key variables:

| Variable | Purpose | Example |
|---|---|---|
| `PORT` | Server port | `3000` |
| `ADMIN_USERNAME` | Admin login username | `admin` |
| `ADMIN_PASSWORD` | Admin login password | `secure_password_here` |
| `SESSION_SECRET` | Session encryption key | Random 32+ chars |
| `DB_PATH` | Database file location | `./database/bbbi.db` |
| `NODE_ENV` | Environment | `development` or `production` |
| `EMAIL_*` | Email settings (Nodemailer) | Gmail SMTP credentials |

## Development Commands

```bash
# Start dev server with auto-reload
npm run dev

# Start production server
npm start

# Run health check
curl http://localhost:3000/health
```

## Database

### Tables

**posts** - User stories and updates
- `id`, `title`, `slug`, `content`, `author_name`, `author_type` (member/caregiver)
- `video_url`, `thumbnail`, `published`, `created_at`

**subscribers** - Email list
- `id`, `email`, `name`, `role` (member/caregiver/ally), `subscribed_at`

**admin_users** - Admin accounts
- `id`, `username`, `password_hash`

### Reset Database

To start fresh:

```bash
rm database/bbbi.db
npm run dev
```

The database will be automatically recreated and admin user re-initialized from `.env`.

## Deployment to Railway

### Prerequisites
- GitHub repository (public or private)
- Railway account (free tier: https://railway.app)

### Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial BBBI platform"
   git remote add origin https://github.com/YOUR_USERNAME/bbbi.git
   git push -u origin main
   ```

2. **Connect Railway:**
   - Log in to Railway dashboard
   - New Project → Deploy from GitHub Repo
   - Select your `bbbi` repository
   - Railway auto-detects Node.js

3. **Add Environment Variables:**
   - Railway Variables tab → Add each from `.env.example`
   - Change `ADMIN_PASSWORD` to a secure value
   - Set `SESSION_SECRET` to a random 32+ character string

4. **Add Persistent Volume (for database):**
   - Settings → Volumes → Add Volume
   - Mount at: `/data`
   - Update `.env`: `DB_PATH=/data/bbbi.db`

5. **Deploy:**
   - Railway auto-deploys on `git push`
   - Watch deployment in Railway dashboard
   - Custom domain: Settings → Domains

## Accessibility

The platform follows WCAG AA standards:

- ✓ Large text (18px+ base, 24px+ headings)
- ✓ High contrast (11.3:1 on primary colors)
- ✓ Skip navigation link
- ✓ Keyboard navigation throughout
- ✓ Semantic HTML5
- ✓ ARIA labels on interactive elements
- ✓ 48px+ touch targets for buttons

## Community Manager Guide

### Adding a Post

1. Log in at `/admin/login`
2. Click **Create New Post**
3. Fill in:
   - **Post Title** - Your story's headline
   - **Your Name** - Author name
   - **I am a...** - Member or Caregiver
   - **Your Story** - Main text (supports basic HTML)
   - **Video Message** (optional) - MP4/MOV from phone
   - Check **Publish immediately** to make it live
4. Click **Save Post**

### Sending Zoom Updates

1. Go to **Admin Dashboard**
2. Click **Download Subscriber List**
3. Use the CSV in your email platform (Mailchimp, Gmail, etc.)
4. Send Zoom link + meeting details

### Managing Posts

- ✓ **View** - Eye icon to see live post
- ✓ **Toggle** - Circular arrows to publish/unpublish
- ✓ **Delete** - Trash icon to remove permanently

## Support

Questions? Issues?

- Check the [plan file](/Users/pauldelaney/.claude/plans/linear-sauteeing-rossum.md) for architecture details
- Review `.env.example` for all configuration options
- Ensure Node.js 20+ is installed: `node --version`

## License

Private project for BBBI community. All rights reserved.
