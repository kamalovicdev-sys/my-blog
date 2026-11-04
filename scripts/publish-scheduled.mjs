// Rejalashtirilgan postlarni o'sha kuni saytga chiqaradi.
// Sayt build paytida sanasi hali kelmagan postlarni o'tkazib yuboradi (src/lib/posts.ts). Bu skript sanasi kelgan, lekin saytda
// hali ochilmayotgan post topsa, Netlify build hook'ni chaqiradi va sayt qayta build qilinadi.
// Har kuni .github/workflows/publish-scheduled.yml ishga tushiradi. Qo'lda tekshirish (build qilmaydi):
//   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/publish-scheduled.mjs --dry-run [--today=2026-11-10]
import fs from 'node:fs';
import path from 'node:path';
// Node .ts fayllardan turlarni o'zi olib tashlaydi (22.18+). Shuning uchun bu uch fayl boshqa fayllarni import qilmasligi kerak
import { addDays, today } from '../src/lib/date.ts';
import { SITE_URL } from '../src/lib/site.ts';
import { slugify } from '../src/lib/slug.ts';

// Oxirgi shuncha kun ichida sanasi kelgan postlar tekshiriladi: o'tkazib yuborilgan ishga tushirish yoki yiqilgan build keyingi safar qoplanadi
const LOOKBACK_DAYS = 2;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const now = args.find((arg) => arg.startsWith('--today='))?.slice('--today='.length) ?? today();
const postsDirectory = path.join(import.meta.dirname, '..', 'content', 'posts');

function log(line) {
  console.log(line);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n\n`);
}

// Frontmatter'dan faqat kerakli maydonlar olinadi. Ular src/lib/posts.ts bilan bir xil ma'noda o'qiladi
function readFrontmatter(text) {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!block) return null;
  const fields = {};
  for (const line of block[1].split(/\r?\n/)) {
    const match = /^(date|draft|slug|title):[ \t]*(.*?)[ \t]*$/.exec(line);
    if (match) fields[match[1]] = match[2];
  }
  return fields;
}

function unquote(value) {
  const quoted = /^(['"])(.*)\1$/.exec(value);
  if (!quoted) return value;
  return quoted[1] === "'" ? quoted[2].replaceAll("''", "'") : quoted[2];
}

function readPost(fileName) {
  const fields = readFrontmatter(fs.readFileSync(path.join(postsDirectory, fileName), 'utf8'));
  const date = fields?.date && /^['"]?(\d{4}-\d{2}-\d{2})/.exec(fields.date)?.[1];
  if (!date) return null;

  const name = fileName.replace(/\.md$/, '');
  const slug = fields.slug ? unquote(fields.slug) : '';
  // Uzun sarlavha YAML'da bir necha qatorga bo'linishi mumkin, unda fayl nomi ishlatiladi
  const title = fields.title && !/^[>|]/.test(fields.title) ? unquote(fields.title) : name;
  // posts.ts'dagi kabi faqat YAML'ning true qiymati qoralama hisoblanadi
  const draft = /^(true|True|TRUE)$/.test(fields.draft ?? '');
  return { fileName, date, title, draft, slug: slug || slugify(name) };
}

async function isLive(post) {
  const url = `${SITE_URL}/posts/${encodeURIComponent(post.slug)}`;
  try {
    const response = await fetch(url, { method: 'HEAD' });
    log(`- ${post.date} ${post.title}: HTTP ${response.status} (${url})`);
    return response.ok;
  } catch (error) {
    // Sayt javob bermasa ham build qilinadi: ortiqcha build zarar qilmaydi
    log(`- ${post.date} ${post.title}: ${error.message} (${url})`);
    return false;
  }
}

const from = addDays(now, -LOOKBACK_DAYS);
const due = fs
  .readdirSync(postsDirectory)
  .filter((fileName) => fileName.endsWith('.md') && !fileName.startsWith('.'))
  .map(readPost)
  .filter((post) => post && !post.draft && post.date >= from && post.date <= now);

log(`Today in Tashkent: ${now}. Posts dated ${from}…${now}: ${due.length}`);

const missing = [];
for (const post of due) {
  if (!(await isLive(post))) missing.push(post);
}

if (missing.length === 0 && !force) {
  log('Nothing to publish: every post whose date has come is already on the site.');
  process.exit(0);
}

const reason = missing.length > 0 ? `Publish scheduled: ${missing.map((post) => post.title).join(', ')}` : 'Publish scheduled posts (manual run)';
if (dryRun) {
  log(`Dry run: would trigger a Netlify build ("${reason}")`);
  process.exit(0);
}

const hook = process.env.NETLIFY_BUILD_HOOK;
if (!hook) {
  log('NETLIFY_BUILD_HOOK is not set. Add the Netlify build hook URL as a repository secret (see .github/workflows/publish-scheduled.yml).');
  process.exit(1);
}

// trigger_title Netlify'dagi deploy ro'yxatida ko'rinadi
const response = await fetch(`${hook}${hook.includes('?') ? '&' : '?'}trigger_title=${encodeURIComponent(reason.slice(0, 200))}`, { method: 'POST' });
if (!response.ok) {
  log(`Netlify build hook failed: HTTP ${response.status} ${await response.text()}`);
  process.exit(1);
}
log(`Netlify build started: ${reason}`);
