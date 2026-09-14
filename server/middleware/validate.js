export function validateRequest(req, res, next) {
  const { category, input } = req.body || {};
  if (!category || !input || !String(category).trim() || !String(input).trim()) {
    return res.status(400).json({ success: false, message: 'Category and input are required' });
  }

  next();
}

export function validateUser(req, res, next) {
  const { name, phone } = req.body || {};
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required' });
  }

  next();
}
