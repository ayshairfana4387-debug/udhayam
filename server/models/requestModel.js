export const requests = [];
export const users = [];

export function validateRequestPayload(payload) {
  if (!payload || !payload.category || !payload.input) {
    return 'Category and input are required';
  }

  if (!payload.category.trim() || !payload.input.trim()) {
    return 'Category and input are required';
  }

  return null;
}
