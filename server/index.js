import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(projectRoot, '.env.local'), override: true });
dotenv.config({ path: path.join(projectRoot, '.env'), override: false });

const port = Number(process.env.PORT || 3001);
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET;
const uploadsPath = path.join(projectRoot, 'server', 'uploads');
const distPath = path.join(projectRoot, 'dist');
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const setupIssues = [];
if (!mongoUri || mongoUri.includes('replace') || mongoUri.includes('your-')) setupIssues.push('Set a valid MONGODB_URI.');
if (!jwtSecret || jwtSecret.length < 32 || jwtSecret.includes('replace')) setupIssues.push('Set a random JWT_SECRET of at least 32 characters.');
if (!process.env.ADMIN_EMAIL || process.env.ADMIN_EMAIL.includes('example.com')) setupIssues.push('Set ADMIN_EMAIL.');
if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.includes('replace') || process.env.ADMIN_PASSWORD.length < 12) {
  setupIssues.push('Set ADMIN_PASSWORD to a value of at least 12 characters.');
}
const setupRequired = setupIssues.length > 0;
const setupMessage = setupIssues.join(' ');

await mkdir(uploadsPath, { recursive: true });

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  password_hash: { type: String, required: true },
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  venue: { type: String, trim: true, maxlength: 180, default: '' },
  event_date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  status: { type: String, required: true, enum: ['upcoming', 'completed'] },
  image_url: { type: String, default: null, maxlength: 500 },
}, { timestamps: true });

eventSchema.index({ status: 1, event_date: 1 });
const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

if (!setupRequired) {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  await Admin.updateOne(
    { email },
    { $set: { password_hash: passwordHash }, $setOnInsert: { email } },
    { upsert: true },
  );
}

const app = express();
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(express.json({ limit: '64kb' }));
app.use('/uploads', express.static(uploadsPath, { maxAge: '7d', immutable: true }));
app.use('/api', (request, response, next) => {
  if (!setupRequired) {
    next();
    return;
  }
  if (request.method === 'GET' && request.path === '/health') {
    response.json({ ok: false, configured: false, error: setupMessage });
    return;
  }
  if (request.method === 'GET' && request.path === '/events') {
    response.set('Cache-Control', 'no-store').json([]);
    return;
  }
  response.status(503).json({ error: `${setupMessage} Update .env.local and restart the server.` });
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (_request, _file, callback) => callback(null, uploadsPath),
    filename: (_request, file, callback) => {
      const extension = file.mimetype === 'image/jpeg' ? '.jpg' : file.mimetype === 'image/png' ? '.png' : '.webp';
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      const error = new Error('Use a JPEG, PNG, or WebP image.');
      error.status = 400;
      callback(error);
      return;
    }
    callback(null, true);
  },
});

function serializeEvent(event) {
  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    venue: event.venue,
    event_date: event.event_date,
    status: event.status,
    image_url: event.image_url,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
  };
}

function requireAdmin(request, response, next) {
  const authorization = request.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  try {
    request.admin = jwt.verify(token, jwtSecret);
    next();
  } catch {
    response.status(401).json({ error: 'Please sign in again to continue.' });
  }
}

function validateEvent(request, response, next) {
  const { title, description, venue = '', event_date: eventDate, status } = request.body;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 180) {
    response.status(400).json({ error: 'Enter an event title up to 180 characters.' });
    return;
  }
  if (typeof description !== 'string' || !description.trim() || description.trim().length > 5000) {
    response.status(400).json({ error: 'Enter event details up to 5000 characters.' });
    return;
  }
  if (typeof venue !== 'string' || venue.length > 180) {
    response.status(400).json({ error: 'Venue must be 180 characters or fewer.' });
    return;
  }
  if (typeof eventDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || Number.isNaN(Date.parse(`${eventDate}T00:00:00Z`))) {
    response.status(400).json({ error: 'Choose a valid event date.' });
    return;
  }
  if (!['upcoming', 'completed'].includes(status)) {
    response.status(400).json({ error: 'Choose upcoming or completed status.' });
    return;
  }
  request.eventInput = { title: title.trim(), description: description.trim(), venue: venue.trim(), event_date: eventDate, status };
  next();
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

app.get('/api/health', (_request, response) => response.json({ ok: true, database: 'mongodb' }));

app.get('/api/events', async (_request, response, next) => {
  try {
    const events = await Event.find().sort({ event_date: 1, _id: 1 }).lean();
    response.set('Cache-Control', 'no-store').json(events.map(serializeEvent));
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/login', loginLimiter, async (request, response, next) => {
  try {
    const email = typeof request.body.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const password = typeof request.body.password === 'string' ? request.body.password : '';
    const admin = await Admin.findOne({ email });
    const validPassword = admin ? await bcrypt.compare(password, admin.password_hash) : false;
    if (!admin || !validPassword) {
      response.status(401).json({ error: 'Email or password is incorrect.' });
      return;
    }
    const token = jwt.sign({ sub: admin._id.toString(), email: admin.email }, jwtSecret, { expiresIn: '8h' });
    response.json({ token, admin: { email: admin.email } });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/session', requireAdmin, async (request, response, next) => {
  try {
    const admin = await Admin.findById(request.admin.sub).select('email').lean();
    if (!admin) {
      response.status(401).json({ error: 'Admin account is no longer active.' });
      return;
    }
    response.json({ admin: { email: admin.email } });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/logout', (_request, response) => response.status(204).end());

app.post('/api/admin/events', requireAdmin, upload.single('image'), validateEvent, async (request, response, next) => {
  try {
    const event = await Event.create({ ...request.eventInput, image_url: request.file ? `/uploads/${request.file.filename}` : null });
    response.status(201).json(serializeEvent(event));
  } catch (error) {
    next(error);
  }
});

app.put('/api/admin/events/:id', requireAdmin, upload.single('image'), validateEvent, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: 'Invalid event id.' });
      return;
    }
    const event = await Event.findById(request.params.id);
    if (!event) {
      response.status(404).json({ error: 'Event not found.' });
      return;
    }
    Object.assign(event, request.eventInput);
    if (request.file) event.image_url = `/uploads/${request.file.filename}`;
    await event.save();
    response.json(serializeEvent(event));
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/events/:id', requireAdmin, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) {
      response.status(400).json({ error: 'Invalid event id.' });
      return;
    }
    const event = await Event.findByIdAndDelete(request.params.id);
    if (!event) {
      response.status(404).json({ error: 'Event not found.' });
      return;
    }
    const imageName = event.image_url?.startsWith('/uploads/') ? path.basename(event.image_url) : '';
    if (imageName) await unlink(path.join(uploadsPath, imageName)).catch(() => {});
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

if (process.env.NODE_ENV === 'production' || existsSync(distPath)) {
  app.use(express.static(distPath, { extensions: ['html'] }));
}

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    response.status(413).json({ error: 'Image must be 10 MB or smaller.' });
    return;
  }
  if (error instanceof mongoose.Error.ValidationError) {
    response.status(400).json({ error: error.message });
    return;
  }
  const status = Number(error.status) || 500;
  if (status >= 500) console.error('API request failed:', error.message);
  response.status(status).json({ error: status >= 500 ? 'The server could not complete the request.' : error.message });
});

const server = app.listen(port, () => {
  console.log(`NITJ site/API listening on http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  if (mongoose.connection.readyState) await mongoose.disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
