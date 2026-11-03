export async function api<T = unknown>(
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const response = await fetch('/api/platform/' + path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'content-type': 'application/json' },
    ...(method !== 'GET' ? { body: JSON.stringify(body ?? {}) } : {}),
  });
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(new Error(result.error?.message ?? 'Request failed.'), {
      status: response.status,
      code: result.error?.code,
    });
  return result as T;
}
