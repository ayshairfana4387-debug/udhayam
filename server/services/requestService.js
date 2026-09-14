import { v4 as uuidv4 } from 'uuid';
import { requests, users, validateRequestPayload } from '../models/requestModel.js';

export function getHealth() {
  return { success: true, message: 'API healthy', timestamp: new Date().toISOString() };
}

export function createUser(payload) {
  if (!payload.name || !payload.phone) {
    throw new Error('Name and phone are required');
  }

  const user = {
    id: uuidv4(),
    name: payload.name,
    phone: payload.phone,
    preferredLanguage: payload.preferredLanguage || 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.push(user);
  return user;
}

export function createRequest(payload) {
  const error = validateRequestPayload(payload);
  if (error) {
    throw new Error(error);
  }

  const request = {
    id: uuidv4(),
    userId: payload.userId || 'anonymous',
    category: payload.category,
    input: payload.input,
    result: payload.result || 'Request registered successfully',
    language: payload.language || 'en',
    status: payload.status || 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  requests.push(request);
  return request;
}

export function getRequests() {
  return requests;
}

export function getRequestById(id) {
  return requests.find((request) => request.id === id);
}

export function updateRequest(id, payload) {
  const request = getRequestById(id);
  if (!request) {
    throw new Error('Request not found');
  }

  Object.assign(request, payload, { updatedAt: new Date().toISOString() });
  return request;
}

export function deleteRequest(id) {
  const index = requests.findIndex((request) => request.id === id);
  if (index === -1) {
    throw new Error('Request not found');
  }

  const [removed] = requests.splice(index, 1);
  return removed;
}

export function getStatistics() {
  return {
    totalUsers: users.length,
    totalRequests: requests.length,
    successfulRequests: requests.filter((request) => request.status === 'successful').length,
    pending: requests.filter((request) => request.status === 'pending').length,
    categoryCounts: requests.reduce((acc, request) => {
      acc[request.category] = (acc[request.category] || 0) + 1;
      return acc;
    }, {})
  };
}
