import { getDeployStatus, triggerDeploy } from '@/lib/admin/deploy';
import { errorResponse } from '@/lib/admin/github';
import { authorizeRequest } from '@/lib/admin/session';

// Saytga hali chiqmagan o'zgarishlar (admin paneldagi Deploy tugmasi uchun)
export async function GET(request: Request) {
  const session = await authorizeRequest(request);
  if (!session) return Response.json({ error: 'Not signed in' }, { status: 401 });

  try {
    return Response.json(await getDeployStatus(session.accessToken));
  } catch (error) {
    return errorResponse(error);
  }
}

// Saytni GitHub'dagi eng oxirgi holat bilan qayta build qiladi
export async function POST(request: Request) {
  const session = await authorizeRequest(request);
  if (!session) return Response.json({ error: 'Not signed in' }, { status: 401 });

  try {
    const result = await triggerDeploy();
    return result.ok ? Response.json({ ok: true }) : Response.json({ error: result.error }, { status: 502 });
  } catch (error) {
    return errorResponse(error);
  }
}
