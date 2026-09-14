export function generateRequestResult(category, input) {
  const categoryLabels = {
    employment: 'Employment support request received',
    finance: 'Finance support request received',
    crop: 'Crop support request received',
    health: 'Health support request received'
  };

  return {
    result: `${categoryLabels[category] || 'Service support request received'}: ${input}`,
    confidence: 'medium'
  };
}
