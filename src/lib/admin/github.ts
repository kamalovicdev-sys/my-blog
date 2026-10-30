import { GITHUB_REPO } from '@/lib/site';

const API_URL = 'https://api.github.com';

export class GitHubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request(token: string, path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...init.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new GitHubError(response.status, body.message ?? response.statusText);
  }
  return response;
}

function contentsPath(filePath: string) {
  const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
  return `/repos/${GITHUB_REPO.owner}/${GITHUB_REPO.name}/contents/${encodedPath}`;
}

export async function getUserLogin(token: string) {
  const user = await (await request(token, '/user')).json();
  return String(user.login);
}

type TreeEntry = { name: string; type: string; object: { oid: string; text: string | null } | null };

// Papkadagi barcha fayllar matni bilan birga, bitta GraphQL so'rovida
export async function listFiles(token: string, directory: string) {
  const query = `query ($owner: String!, $name: String!, $expression: String!) {
    repository(owner: $owner, name: $name) {
      object(expression: $expression) {
        ... on Tree { entries { name type object { ... on Blob { oid text } } } }
      }
    }
  }`;
  const response = await request(token, '/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query,
      variables: { owner: GITHUB_REPO.owner, name: GITHUB_REPO.name, expression: `${GITHUB_REPO.branch}:${directory}` },
    }),
  });
  const json = await response.json();
  if (json.errors) throw new GitHubError(502, json.errors[0].message);

  const entries: TreeEntry[] = json.data.repository?.object?.entries ?? [];
  return entries
    .filter((entry) => entry.type === 'blob' && entry.object)
    .map((entry) => ({ name: entry.name, sha: entry.object!.oid, text: entry.object!.text }));
}

export async function getFile(token: string, filePath: string) {
  const file = await (await request(token, `${contentsPath(filePath)}?ref=${GITHUB_REPO.branch}`)).json();
  return { sha: String(file.sha), text: Buffer.from(file.content, 'base64').toString('utf8') };
}

export async function fileExists(token: string, filePath: string) {
  try {
    await request(token, `${contentsPath(filePath)}?ref=${GITHUB_REPO.branch}`, { method: 'HEAD' });
    return true;
  } catch (error) {
    if (error instanceof GitHubError && error.status === 404) return false;
    throw error;
  }
}

// Yangi fayl yaratadi yoki sha berilsa mavjudini yangilaydi. Yangi sha qaytaradi
export async function putFile(token: string, filePath: string, base64Content: string, message: string, sha?: string) {
  const response = await request(token, contentsPath(filePath), {
    method: 'PUT',
    body: JSON.stringify({ message, content: base64Content, branch: GITHUB_REPO.branch, ...(sha && { sha }) }),
  });
  return String((await response.json()).content.sha);
}

export async function deleteFile(token: string, filePath: string, sha: string, message: string) {
  await request(token, contentsPath(filePath), {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: GITHUB_REPO.branch }),
  });
}

// API xatosini foydalanuvchiga tushunarli javobga aylantiradi
export function errorResponse(error: unknown) {
  if (error instanceof GitHubError) {
    if (error.status === 401) return Response.json({ error: 'Session expired. Sign in again and retry.' }, { status: 401 });
    if (error.status === 409 || error.status === 422) {
      return Response.json({ error: 'This file was changed elsewhere. Reload the page to get the latest version.' }, { status: 409 });
    }
    return Response.json({ error: `GitHub: ${error.message}` }, { status: 502 });
  }
  console.error(error);
  return Response.json({ error: 'Unexpected server error' }, { status: 500 });
}
