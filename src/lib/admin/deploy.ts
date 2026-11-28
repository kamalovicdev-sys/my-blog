import { summarizeDeploy, type DeploySummary } from './commits';
import { listRecentCommits } from './github';

// Saytdagi versiya shuncha commit ichida topilmasa, o'zgarishlar "100+" deb ko'rsatiladi
const COMMIT_LIMIT = 100;

export type DeployStatus = DeploySummary & {
  // Netlify'da NETLIFY_BUILD_HOOK berilgan: tugma build boshlay oladi
  configured: boolean;
};

export async function getDeployStatus(token: string): Promise<DeployStatus> {
  // next.config.ts build paytida Netlify'ning COMMIT_REF qiymatini shu yerga yozadi
  const deployed = process.env.BUILD_COMMIT || null;
  const commits = await listRecentCommits(token, COMMIT_LIMIT);
  return { configured: Boolean(process.env.NETLIFY_BUILD_HOOK), ...summarizeDeploy(commits, deployed, Date.now()) };
}

// Netlify build hook: branch'ning eng oxirgi holatini build qilib saytga chiqaradi
export async function triggerDeploy() {
  const hook = process.env.NETLIFY_BUILD_HOOK;
  if (!hook) return { ok: false as const, error: 'NETLIFY_BUILD_HOOK is not set in Netlify' };
  // trigger_title Netlify'dagi deploy ro'yxatida ko'rinadi
  const response = await fetch(`${hook}${hook.includes('?') ? '&' : '?'}trigger_title=${encodeURIComponent('Deploy from admin panel')}`, {
    method: 'POST',
    cache: 'no-store',
  });
  if (!response.ok) return { ok: false as const, error: `Netlify build hook failed: HTTP ${response.status}` };
  return { ok: true as const };
}
