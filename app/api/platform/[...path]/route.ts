import 'server-only';
import { proxy } from '../../../../../backend/packages/web-proxy/src';
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  return proxy(request, (await context.params).path, 'admin');
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
