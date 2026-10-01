# NITJ SwaYaan Drone Project

A responsive React-based public website and admin dashboard for the SwaYaan drone technology initiative at Dr B R Ambedkar National Institute of Technology Jalandhar.

The project preserves the original website design while adding a MongoDB-backed event management workflow. Administrators can publish upcoming and completed events, add event descriptions, upload images, and update the public website without editing source code.

## Highlights

- Responsive React frontend using the existing Bootstrap and NITJ visual theme.
- Homepage with project overview, team, completed bootcamps, contact details, map, and image carousel.
- Dedicated pages for all bootcamp details and the complete bootcamp archive.
- Separate upcoming events page populated from MongoDB.
- Admin login with bcrypt password hashing and JWT authentication.
- Admin CRUD operations for events: create, edit, delete, and status management.
- Event image uploads with JPEG, PNG, and WebP validation and a 10 MB size limit.
- Security headers through Helmet and login rate limiting through Express Rate Limit.
- Session-only browser token storage so admin login is not persisted across browser sessions.
- Vite production build with separate entry pages for the homepage, admin dashboard, upcoming events, and bootcamp archive.

## Technology Stack

### Frontend

- React 19
- Vite
- Bootstrap grid and Bootstrap Icons
- Existing NITJ `main.css` theme

### Backend

- Node.js
- Express
- Mongoose
- MongoDB or MongoDB Atlas
- JWT
- bcryptjs
- Multer
- Helmet
- Express Rate Limit

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` or `/index.html` | Public homepage |
| `/admin.html` | Protected event management dashboard |
| `/upcoming.html` | Upcoming events from MongoDB |
| `/bootcamps.html` | Full completed bootcamp archive |
| `/Boot1.html` to `/boot20.html` | Individual bootcamp detail pages |

## Project Structure

```text
.
├── assets/
│   ├── css/main.css
│   ├── img/
│   └── vendor/
├── server/
│   ├── index.js
│   └── uploads/
├── src/
│   ├── Admin.jsx
│   ├── admin.css
│   ├── api.js
│   ├── assets.js
│   └── main.jsx
├── admin.html
├── bootcamps.html
├── upcoming.html
├── index.html
├── package.json
└── vite.config.js
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB Community Server running locally, or a MongoDB Atlas connection string

## Configuration

Create a `.env.local` file in the project root. Do not commit this file.

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/nitj_drone
JWT_SECRET=generate-a-random-secret-of-at-least-32-characters
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-strong-password-of-at-least-12-characters
PORT=3001
```

Generate a secure JWT secret with PowerShell or Node.js:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

The API creates the MongoDB collections automatically and synchronizes the configured admin password as a bcrypt hash when the server starts.

## Run Locally

From the inner project directory:

```powershell
cd "D:\Downloads\NITJ (2)\NITJ\NITJ"
npm install
npm run dev
```

This starts:

- Vite frontend: `http://localhost:5173`
- Express API: `http://localhost:3001`

Open the website at:

```text
http://localhost:5173/
```

Open the admin dashboard at:

```text
http://localhost:5173/admin.html
```

To run the processes separately:

```powershell
npm run dev:api
npm run dev:web
```

## Production Build

```powershell
npm run build
npm start
```

The Express server serves the generated `dist/` frontend when the build exists.

## Admin Workflow

1. Start MongoDB.
2. Configure `.env.local` with `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. Start the application with `npm run dev`.
4. Open `/admin.html`.
5. Sign in using the configured admin credentials.
6. Add an event with title, institute/venue, date, status, details, and an optional image.
7. Choose `upcoming` to show the event on `/upcoming.html`.
8. Choose `completed` to include the event in the completed bootcamp archive.

## API Endpoints

### Public

- `GET /api/health`
- `GET /api/events`

### Admin

- `POST /api/admin/login`
- `GET /api/admin/session`
- `POST /api/admin/logout`
- `POST /api/admin/events`
- `PUT /api/admin/events/:id`
- `DELETE /api/admin/events/:id`

Admin write requests require a valid JWT bearer token.

## Resume-Ready Description

**NITJ SwaYaan Drone Project Website** - Built a responsive React/Vite website and MongoDB-backed admin dashboard for managing drone technology bootcamps and events. Implemented Express REST APIs, JWT authentication, bcrypt password hashing, protected event CRUD operations, validated image uploads, public upcoming/completed event pages, and a preserved Bootstrap-based institutional design system.

### Resume Bullet Points

- Developed a responsive React/Vite frontend for an institutional drone technology project, preserving the existing Bootstrap visual system across desktop and mobile layouts.
- Built an Express and MongoDB event management API with Mongoose schemas, CRUD endpoints, admin authentication, bcrypt password hashing, and JWT authorization.
- Implemented secure image uploads with MIME type validation, file-size limits, generated filenames, and protected admin-only write operations.
- Created separate public routes for the homepage, upcoming events, completed bootcamp archive, and individual bootcamp details.
- Added Helmet security headers, login rate limiting, session-only admin token storage, environment-based configuration, and production build support.

## Security Notes

- Never commit `.env.local`.
- Never expose MongoDB credentials, JWT secrets, or admin passwords in frontend code.
- Use a strong unique admin password in production.
- Use MongoDB Atlas network access rules or a secured private MongoDB deployment for production hosting.
- Run the application behind HTTPS in production.

## Validation

The project has been validated with:

```powershell
npm run build
node --check server/index.js
```

The MongoDB API flow has also been tested for admin login, event creation, public event reads, event updates, event deletion, and image upload serving.
