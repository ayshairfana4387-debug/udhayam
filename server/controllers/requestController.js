import { createRequest, createUser, deleteRequest, getHealth, getRequestById, getRequests, getStatistics, updateRequest } from '../services/requestService.js';

export function healthController(req, res) {
  res.json(getHealth());
}

export function userController(req, res) {
  try {
    const user = createUser(req.body);
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Unable to create user' });
  }
}

export function createRequestController(req, res) {
  try {
    const request = createRequest(req.body);
    res.status(201).json({ success: true, request, message: 'Request created successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Unable to process the request' });
  }
}

export function getRequestsController(req, res) {
  res.json({ success: true, requests: getRequests() });
}

export function getRequestController(req, res) {
  const request = getRequestById(req.params.id);
  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  res.json({ success: true, request });
}

export function updateRequestController(req, res) {
  try {
    const request = updateRequest(req.params.id, req.body);
    res.json({ success: true, request, message: 'Request updated successfully' });
  } catch (error) {
    const status = error.message === 'Request not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message || 'Unable to update request' });
  }
}

export function deleteRequestController(req, res) {
  try {
    const request = deleteRequest(req.params.id);
    res.json({ success: true, request, message: 'Request deleted successfully' });
  } catch (error) {
    const status = error.message === 'Request not found' ? 404 : 400;
    res.status(status).json({ success: false, message: error.message || 'Unable to delete request' });
  }
}

export function statisticsController(req, res) {
  res.json({ success: true, statistics: getStatistics() });
}
