const tokenKey = 'nitj-event-admin-token';
localStorage.removeItem(tokenKey);

async function request(path, { token = sessionStorage.getItem(tokenKey), ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  const response = await fetch(path, { ...options, headers });
  if (response.status === 204) return null;
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return result;
}

export function getEvents() {
  return request('/api/events', { token: null });
}

export async function getApiHealth() {
  const health = await request('/api/health', { token: null });
  if (!health.ok) throw new Error(health.error || 'MongoDB is not configured.');
  return health;
}

export async function getAdminSession() {
  const token = sessionStorage.getItem(tokenKey);
  if (!token) return null;
  try {
    return await request('/api/admin/session', { token });
  } catch (error) {
    if (error.status === 401) sessionStorage.removeItem(tokenKey);
    throw error;
  }
}

export async function signIn(email, password) {
  const result = await request('/api/admin/login', {
    method: 'POST',
    token: null,
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem(tokenKey, result.token);
  return result.admin;
}

export function signOut() {
  const token = sessionStorage.getItem(tokenKey);
  sessionStorage.removeItem(tokenKey);
  return request('/api/admin/logout', { method: 'POST', token }).catch(() => null);
}

export function saveEvent(values, eventId, imageFile) {
  const form = new FormData();
  for (const [key, value] of Object.entries(values)) form.append(key, value);
  if (imageFile) form.append('image', imageFile);
  const path = eventId ? `/api/admin/events/${eventId}` : '/api/admin/events';
  return request(path, {
    method: eventId ? 'PUT' : 'POST',
    body: form,
  });
}

export function deleteEvent(eventId) {
  return request(`/api/admin/events/${eventId}`, { method: 'DELETE' });
}
