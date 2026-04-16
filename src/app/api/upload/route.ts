import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { findUserById } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

// Allowed MIME types and their extensions
const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'text/plain': '.txt',
  'text/csv': '.csv',
  'application/zip': '.zip',
  'application/x-zip-compressed': '.zip',
};

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 401 });

  const fullUser = await findUserById(user.id);

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand gevonden' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Bestand is te groot (max 25 MB)' }, { status: 400 });
    }

    const mimeType = file.type || 'application/octet-stream';
    const ext = ALLOWED_TYPES[mimeType] || path.extname(file.name).toLowerCase() || '.bin';

    if (!ALLOWED_TYPES[mimeType] && !path.extname(file.name)) {
      return NextResponse.json({ error: 'Bestandstype niet toegestaan' }, { status: 400 });
    }

    // Ensure upload dir exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Generate a unique stored filename
    const storedName = `${crypto.randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, storedName);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    return NextResponse.json({
      filename: file.name,
      storedName,
      mimeType,
      size: file.size,
      url: `/uploads/${storedName}`,
      uploadedBy: user.id,
      uploadedByName: fullUser?.name || user.name,
    });

  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload mislukt' }, { status: 500 });
  }
}
