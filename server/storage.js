import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'data', 'uploads');

function ensureUploadsDir() {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
}

export function saveUploadedFile(buffer, originalName, mimeType) {
  ensureUploadsDir();
  const ext = path.extname(originalName) || '';
  const storedName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const storedPath = path.join(UPLOADS_DIR, storedName);
  fs.writeFileSync(storedPath, buffer);
  return {
    id: storedName,
    name: originalName,
    type: mimeType || 'application/octet-stream',
    size: buffer.length,
    storedName,
  };
}

export function getUploadPath(storedName) {
  const resolved = path.resolve(UPLOADS_DIR, storedName);
  if (!resolved.startsWith(path.resolve(UPLOADS_DIR))) {
    return null;
  }
  return fs.existsSync(resolved) ? resolved : null;
}

export function getUploadsDir() {
  ensureUploadsDir();
  return UPLOADS_DIR;
}
