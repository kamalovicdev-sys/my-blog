import { deleteCommitMessage, saveCommitMessage } from '@/lib/admin/commits';
import { deleteFile, errorResponse, fileExists, putFile } from '@/lib/admin/github';
import { isPostFileName, parsePostForm, POSTS_DIRECTORY, serializePostForm } from '@/lib/admin/post-file';
import { authorizeRequest } from '@/lib/admin/session';
import { today } from '@/lib/date';
import { parsePost } from '@/lib/posts';
import { slugify } from '@/lib/slug';

// Saqlashdan oldingi sana: post saytda ko'rinib turganmi, shunga qarab build darhol boshlanadi yoki Deploy'ni kutadi
function previousDate(value: unknown, fallback: string) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

// Yangi post yaratish yoki mavjudini saqlash
export async function POST(request: Request) {
  const session = await authorizeRequest(request);
  if (!session) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const input = await request.json();
  const form = parsePostForm(input.form);
  if (typeof form === 'string') return Response.json({ error: form }, { status: 400 });

  const isNew = !input.fileName;
  const fileName = isNew ? `${slugify(String(input.slug || form.title))}.md` : String(input.fileName);
  if (!isPostFileName(fileName)) return Response.json({ error: 'Invalid post URL' }, { status: 400 });
  const filePath = `${POSTS_DIRECTORY}/${fileName}`;

  try {
    if (isNew && (await fileExists(session.accessToken, filePath))) {
      return Response.json({ error: `A post with the URL "${fileName.replace(/\.md$/, '')}" already exists` }, { status: 409 });
    }

    const message = saveCommitMessage({
      title: form.title.trim(),
      isNew,
      wasDraft: input.wasDraft === true,
      wasDate: previousDate(input.wasDate, form.date),
      draft: form.draft,
      date: form.date,
      today: today(),
    });
    const source = serializePostForm(form);
    const sha = await putFile(session.accessToken, filePath, Buffer.from(source).toString('base64'), message, input.sha);

    return Response.json({ fileName, sha, slug: parsePost(fileName, source)?.meta.slug });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  const session = await authorizeRequest(request);
  if (!session) return Response.json({ error: 'Not signed in' }, { status: 401 });

  const { fileName, sha, title, wasDraft, wasDate } = await request.json();
  if (typeof fileName !== 'string' || !isPostFileName(fileName) || typeof sha !== 'string') {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  try {
    // Sana noma'lum bo'lsa post saytda deb olinadi: o'chirilgan post saytda qolib ketmasin
    const message = deleteCommitMessage({ title: title || fileName, wasDraft: wasDraft === true, wasDate: previousDate(wasDate, '0000-01-01'), today: today() });
    await deleteFile(session.accessToken, `${POSTS_DIRECTORY}/${fileName}`, sha, message);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
