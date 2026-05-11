export async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('admin_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options?.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }

  return response;
}
