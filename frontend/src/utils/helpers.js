import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a date string as "2 hours ago", "3 days ago", etc.
 */
export const timeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

/**
 * Format a date string as "Jan 15, 2024 at 10:30 AM"
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a');
};

/**
 * Format a date string as "15/01/2024"
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return 'N/A';
  return format(new Date(dateString), 'dd/MM/yyyy');
};

/**
 * Truncate a string to maxLength and append ellipsis.
 */
export const truncate = (str, maxLength = 100) => {
  if (!str) return '';
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

/**
 * Capitalize first letter of a string.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert snake_case to Title Case.
 * "water_supply" → "Water Supply"
 */
export const snakeToTitle = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map((word) => capitalize(word))
    .join(' ');
};

/**
 * Generate initials from a full name.
 * "John Doe" → "JD"
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

/**
 * Validate Indian phone number.
 */
export const isValidIndianPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

/**
 * Build query string from params object (skips null/undefined).
 */
export const buildQueryString = (params) => {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== '')
  );
  return new URLSearchParams(filtered).toString();
};
