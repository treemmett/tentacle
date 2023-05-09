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
  });

  const responseData = await response.json();

  if (!response.ok || responseData?.error) {
    if (responseData.error.code) {
      const found = Object.entries(Errors).find(([name]) => name === responseData.error.code);

      if (found) {
        throw new found[1](responseData.error.message, response.status);
      }
    }

    throw new Errors.APIError(responseData.error.message || 'An unknown error occurred');
  }

  return responseData;
}
