const API_BASE = import.meta.env.VITE_API_BASE || '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ success: false, message: 'Unable to process the request' }));
    throw new Error(data.message || 'Unable to process the request');
  }

  return response.json();
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
