import to from 'await-to-js';

export default async function fetcher<T, D = T>(
  url: string,
  method: 'get' | 'put' | 'post' | 'patch' | 'delete' = 'get',
  data?: D
): Promise<T> {
  const body = data ? JSON.stringify(data) : undefined;
  const headers = data ? { 'Content-Type': 'application/json' } : undefined;
  const [err, res] = await to<Response>(fetch(url, { headers, method, body }));
  if (res && !res.ok) {
    const { message } = (await res.json()) as Error;
    const msg = `API (${url}) responded with error: ${message}`;
    throw new Error(msg);
  } else if (err) {
    throw new Error(`${err.name} calling API (${url}): ${err.message}`);
  } else if (!res) {
    throw new Error(`No response from API (${url})`);
  }
  return res.json() as Promise<T>;
}
