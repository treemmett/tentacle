import * as Errors from './errors';

export async function api<TData>(
  method: 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT',
  url: string,
  data?: object
): Promise<TData> {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');

  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`/api${url}`, {
    body: data ? JSON.stringify(data) : undefined,
    headers,
    method,
  }).then((r) => r.json());

  if (response?.error) {
    if (response.error.code) {
      const found = Object.entries(Errors).find(([name]) => name === response.error.code);

      if (found) {
        throw new found[1](response.error.message, response.status);
      }
    } else {
      throw new Error(response.error.message);
    }
  }

  return response;
}
