import apiEndpoints from '../redux/apiEndpoint';

/**
 * Converts relative upload paths (e.g. subjects/banner_123.jpg)
 * into absolute backend URLs. Returns fallback if null/empty.
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanBase = apiEndpoints.baseUrl.replace(/\/api\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath.startsWith('/uploads/')) {
    return `${cleanBase}${cleanPath}`;
  }
  return `${cleanBase}/uploads${cleanPath}`;
};
