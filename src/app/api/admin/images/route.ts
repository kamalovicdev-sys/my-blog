import path from 'path';
import { errorResponse, fileExists, putFile } from '@/lib/admin/github';
import { authorizeRequest } from '@/lib/admin/session';
import { IMAGE_CONTENT_TYPES } from '@/lib/images';
import { slugify } from '@/lib/slug';

// Netlify funksiyasiga keladigan so'rov 6 MB'dan oshmasligi kerak (base64 hajmni ~33% oshiradi)
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGES_DIRECTORY = 'content/images';

export async function POST(request: Request) {
  const session = await authorizeRequest(request);
  if (!session) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const { name, data } = await request.json();
  const extension = path.extname(String(name)).toLowerCase();
  if (!IMAGE_CONTENT_TYPES[extension]) return Response.json({ error: 'Unsupported image type' }, { status: 400 });

  const bytes = Buffer.from(String(data), 'base64');
  if (bytes.length === 0) return Response.json({ error: 'Image is empty' }, { status: 400 });
  if (bytes.length > MAX_IMAGE_BYTES) return Response.json({ error: 'Image is larger than 4 MB' }, { status: 413 });

  try {
    // Bir xil nomli rasm bor bo'lsa, oxiriga raqam qo'shamiz: rasm.webp → rasm-1.webp
    const baseName = slugify(path.basename(String(name), extension)) || 'image';
    let fileName = `${baseName}${extension}`;
    for (let i = 1; await fileExists(session.accessToken, `${IMAGES_DIRECTORY}/${fileName}`); i++) {
      fileName = `${baseName}-${i}${extension}`;
    }

    // Rasm o'zi saytni o'zgartirmaydi: u post bilan birga saqlanganda build bo'ladi
    await putFile(session.accessToken, `${IMAGES_DIRECTORY}/${fileName}`, bytes.toString('base64'), `Add image: ${fileName} [skip netlify]`);
    return Response.json({ markdownPath: `../images/${fileName}` });
  } catch (error) {
    return errorResponse(error);
  }
}
