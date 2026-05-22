/**
 * Convert snake_case to Title Case.
 * "water_supply" → "Water Supply"
 */
const snakeToTitle = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

/**
 * Safely truncate a string to maxLen characters.
 */
const truncate = (str, maxLen = 100) => {
  if (!str) return '';
  return str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;
};

module.exports = { snakeToTitle, truncate };
