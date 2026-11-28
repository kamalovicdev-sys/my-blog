// Admin panel commit xabarlari va ularning sayt build'iga ta'siri. Netlify "[skip netlify]" bor commitni build qilmaydi.
// Saytdagi ko'rinish o'zgarsa (e'lon qilish, saytdan olish, o'chirish) build darhol boshlanadi. Saytdagi postni tahrirlash
// esa build qilmaydi: o'zgarishlar admin paneldagi Deploy tugmasi bilan birga chiqadi (har bir deploy Netlify kreditini oladi)
export const SKIP_BUILD = '[skip netlify]';

// Netlify build odatda 1-2 daqiqada tugaydi. Shundan yangi build hali ketyapti deb hisoblanadi (server ham, Deploy tugmasi ham)
export const BUILD_WINDOW_MS = 10 * 60 * 1000;

// Post saytda ko'rinadimi: e'lon qilingan va sanasi kelgan (src/lib/posts.ts bilan bir xil qoida)
function isLive(draft: boolean, date: string, today: string) {
  return !draft && date <= today;
}

type SavedPost = { title: string; isNew: boolean; wasDraft: boolean; wasDate: string; draft: boolean; date: string; today: string };

export function saveCommitMessage({ title, isNew, wasDraft, wasDate, draft, date, today }: SavedPost) {
  const wasLive = !isNew && isLive(wasDraft, wasDate, today);
  const nowLive = isLive(draft, date, today);
  if (!wasLive && nowLive) return `Publish post: ${title}`;
  // Kelajak sana qo'yilsa post o'sha kungacha saytdan yo'qoladi
  if (wasLive && !nowLive) return `${draft ? 'Unpublish' : 'Reschedule'} post: ${title}`;
  if (wasLive) return `Update post: ${title} ${SKIP_BUILD}`;
  // Saytda yo'q va hozircha bo'lmaydi: qoralama yoki rejalashtirilgan post (u o'z kuni publish-scheduled.yml bilan chiqadi)
  return `${isNew ? 'Add' : 'Update'} ${draft ? 'draft' : 'scheduled post'}: ${title} ${SKIP_BUILD}`;
}

export function deleteCommitMessage({ title, wasDraft, wasDate, today }: Pick<SavedPost, 'title' | 'wasDraft' | 'wasDate' | 'today'>) {
  if (isLive(wasDraft, wasDate, today)) return `Delete post: ${title}`;
  return `Delete ${wasDraft ? 'draft' : 'scheduled post'}: ${title} ${SKIP_BUILD}`;
}

// Rasm o'zi saytni o'zgartirmaydi: u post bilan birga saqlanganda saytga chiqadi
export function imageCommitMessage(fileName: string) {
  return `Add image: ${fileName} ${SKIP_BUILD}`;
}

// Saytdagi versiyadan keyingi commit saytni o'zgartiradimi.
// "build": Netlify uni push bilan o'zi build qiladi, "deferred": Deploy tugmasini kutadi, null: saytga ta'sir qilmaydi
export function commitEffect(message: string): 'build' | 'deferred' | null {
  const subject = message.split('\n')[0];
  if (!subject.includes(SKIP_BUILD)) return 'build';
  return subject.startsWith('Update post: ') ? 'deferred' : null;
}

// Ro'yxatda ko'rsatiladigan nom: "Update post: Sarlavha [skip netlify]" → "Update post: Sarlavha"
export function commitLabel(message: string) {
  return message.split('\n')[0].replace(SKIP_BUILD, '').trim();
}

type Commit = { sha: string; message: string; date: string };

export type DeployChange = { label: string; count: number };

export type DeploySummary = {
  // Saytdagi versiya ma'lum (lokal `npm run dev`da noma'lum)
  known: boolean;
  // GitHub'dagi eng oxirgi commit
  head: string | null;
  // Saytga hali chiqmagan o'zgarishlar, eskisi oldin. Bir postning bir necha saqlanishi bitta qator bo'ladi
  changes: DeployChange[];
  // Saytdagi versiya o'qilgan commitlar ichida topilmadi: o'zgarishlar ko'rsatilganidan ko'p
  more: boolean;
  // Push bilan boshlangan build hozir ketyapti (commit vaqti): u shu commitgacha bo'lgan hamma narsani chiqaradi
  buildingSince: string | null;
  // Build'dan keyin ham saytga chiqmay qoladigan o'zgarish bor: Deploy tugmasi kerak
  needsDeploy: boolean;
};

function group(labels: string[]) {
  const changes = new Map<string, DeployChange>();
  for (const label of labels) {
    const change = changes.get(label) ?? { label, count: 0 };
    change.count += 1;
    // Oxirgi saqlangan joyiga o'tadi: ro'yxat oxirgi o'zgarish bo'yicha tartiblanadi
    changes.delete(label);
    changes.set(label, change);
  }
  return [...changes.values()];
}

// commits: branch'dagi oxirgi commitlar, yangisi oldin. deployed: saytdagi versiya build qilingan commit
export function summarizeDeploy(commits: Commit[], deployed: string | null, now: number): DeploySummary {
  const head = commits[0]?.sha ?? null;
  if (!deployed) return { known: false, head, changes: [], more: false, buildingSince: null, needsDeploy: true };

  const index = commits.findIndex((commit) => commit.sha === deployed);
  // Saytdagi versiyadan keyingi commitlar, eskisi oldin
  const newer = (index === -1 ? commits : commits.slice(0, index)).toReversed();
  const pending = newer.map((commit) => ({ ...commit, effect: commitEffect(commit.message) })).filter((commit) => commit.effect !== null);

  // Netlify push qilingan commitni o'zi build qiladi: yaqinda bo'lgan bo'lsa, u va undan oldingilar hozir saytga chiqyapti
  const lastBuild = pending.findLast((commit) => commit.effect === 'build');
  const building = lastBuild && now - new Date(lastBuild.date).getTime() < BUILD_WINDOW_MS ? lastBuild : null;
  const waiting = building ? pending.slice(pending.indexOf(building) + 1) : pending;

  return {
    known: true,
    head,
    changes: group(pending.map((commit) => commitLabel(commit.message))),
    more: index === -1,
    buildingSince: building?.date ?? null,
    needsDeploy: waiting.length > 0 || index === -1,
  };
}
