export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.status = status; }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const csrf = document.cookie.split('; ').find(row => row.startsWith('csrftoken='))?.split('=')[1];
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRFToken': decodeURIComponent(csrf) } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.error || (response.status === 404 ? 'We couldn’t find that page.' : 'Something went wrong. Please try again.'), response.status);
  return data as T;
}

export function post<T>(path: string, data: unknown = {}) {
  return api<T>(path, { method: 'POST', body: JSON.stringify(data) });
}

export function duration(minutes: number) {
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60 ? `${minutes % 60}m` : ''}`.trim() : `${minutes} min`;
}
