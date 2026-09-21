import {
  getUserSchemes,
  getUserSchemeById,
  createUserScheme,
  updateUserScheme,
  recordSchemePayment,
  deleteUserScheme,
  getActiveNotifications
} from '../services/userSchemeService.js';

export function getUserSchemesController(req, res) {
  try {
    const userId = req.query.userId || 'rajesh-kumar';
    const schemes = getUserSchemes(userId);
    res.json({ success: true, schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch user schemes' });
  }
}

export function getUserSchemeController(req, res) {
  try {
    const scheme = getUserSchemeById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme journey not found' });
    }
    res.json({ success: true, scheme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch scheme' });
  }
}

export function createUserSchemeController(req, res) {
  try {
    const scheme = createUserScheme(req.body);
    res.status(201).json({ success: true, scheme, message: 'Scheme journey saved to history' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to save scheme journey' });
  }
}

export function updateUserSchemeController(req, res) {
  try {
    const scheme = updateUserScheme(req.params.id, req.body);
    res.json({ success: true, scheme, message: 'Scheme journey updated' });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: error.message || 'Failed to update scheme journey' });
  }
}

export function recordSchemePaymentController(req, res) {
  try {
    const scheme = recordSchemePayment(req.params.id);
    res.json({ success: true, scheme, message: 'Payment recorded and next month scheduled' });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: error.message || 'Failed to record payment' });
  }
}

export function deleteUserSchemeController(req, res) {
  try {
    const scheme = deleteUserScheme(req.params.id);
    res.json({ success: true, scheme, message: 'Scheme journey removed from history' });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ success: false, message: error.message || 'Failed to delete scheme journey' });
  }
}

export function getNotificationsController(req, res) {
  try {
    const userId = req.query.userId || 'rajesh-kumar';
    const notifications = getActiveNotifications(userId);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications' });
  }
}
