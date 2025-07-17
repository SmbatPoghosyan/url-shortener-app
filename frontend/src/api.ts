export const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const url = path.startsWith('http')
    ? path
    : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const response = await fetch(url, { ...options, headers });
  return response;
};
