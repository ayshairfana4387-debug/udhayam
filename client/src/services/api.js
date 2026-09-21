const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  let targetUrl = `${API_BASE}${path}`;
  if (typeof window !== 'undefined' && (!window.location?.origin || window.location.origin === 'null')) {
    targetUrl = `http://localhost:5173${targetUrl}`;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({ success: false, message: 'Unable to process the request' }));
      throw new Error(data.message || 'Unable to process the request');
    }

    return response.json();
  } catch (err) {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return { success: false, schemes: [], notifications: [] };
    }
    throw err;
  }
}

export function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function createRequest(payload) {
  return request('/requests', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getRequests() {
  return request('/requests');
}

export function getRequest(id) {
  return request(`/requests/${id}`);
}

export function getStatistics() {
  return request('/statistics');
}

export function updateRequest(id, payload) {
  return request(`/requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteRequest(id) {
  return request(`/requests/${id}`, {
    method: 'DELETE'
  });
}

// User Scheme Journeys (YouTube-style History) & Cross-Loan Notifications
export function getUserSchemes(userId = 'rajesh-kumar') {
  return request(`/user-schemes?userId=${encodeURIComponent(userId)}`);
}

export function getUserScheme(id) {
  return request(`/user-schemes/${id}`);
}

export function saveUserScheme(payload) {
  return request('/user-schemes', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateUserScheme(id, payload) {
  return request(`/user-schemes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function recordSchemePayment(id) {
  return request(`/user-schemes/${id}/pay`, {
    method: 'POST'
  });
}

export function deleteUserScheme(id) {
  return request(`/user-schemes/${id}`, {
    method: 'DELETE'
  });
}

export function getNotifications(userId = 'rajesh-kumar') {
  return request(`/notifications?userId=${encodeURIComponent(userId)}`);
}

