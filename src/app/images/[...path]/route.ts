import fs from 'fs';
import path from 'path';

// Obsidian rasmlarni content/images'ga saqlaydi, sayt ularni /images/... manzilida beradi
const imagesDirectory = path.join(process.cwd(), 'content/images');

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

function getImagePaths() {
  return fs
    .readdirSync(imagesDirectory, { recursive: true, encoding: 'utf8' })
    .filter((filePath) => CONTENT_TYPES[path.extname(filePath).toLowerCase()]);
}

// Rasmlar build paytida statik fayl sifatida tayyorlanadi
export const dynamicParams = false;

export function generateStaticParams() {
  return getImagePaths().map((filePath) => ({ path: filePath.split(path.sep) }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const imagePath = (await params).path.join(path.sep);
  if (!getImagePaths().includes(imagePath)) {
    return new Response(null, { status: 404 });
  }

  const contentType = CONTENT_TYPES[path.extname(imagePath).toLowerCase()];
  return new Response(fs.readFileSync(path.join(imagesDirectory, imagePath)), {
    headers: { 'Content-Type': contentType },
  });
}
