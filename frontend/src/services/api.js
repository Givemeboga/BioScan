// API Base Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const normalizeEndpoint = (endpoint) => {
  if (!endpoint) {
    return '';
  }

  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

const buildUrl = (endpoint) => {
  const normalizedEndpoint = normalizeEndpoint(endpoint);

  if (!API_BASE_URL) {
    return normalizedEndpoint;
  }

  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  return `${normalizedBase}${normalizedEndpoint}`;
};

export const apiClient = {
  // Helper function for API calls
  async request(endpoint, options = {}) {
    const url = buildUrl(endpoint);
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const buildErrorMessage = (errorPayload, status) => {
      if (!errorPayload) {
        return `HTTP Error: ${status}`;
      }

      const detail = errorPayload.detail ?? errorPayload.error ?? errorPayload.message;
      if (typeof detail === 'string') {
        return detail;
      }

      if (Array.isArray(detail)) {
        const messages = detail
          .map((item) => {
            if (typeof item === 'string') {
              return item;
            }
            if (item?.msg && item?.loc) {
              return `${item.loc.join('.')}: ${item.msg}`;
            }
            return item?.msg || JSON.stringify(item);
          })
          .filter(Boolean);
        if (messages.length > 0) {
          return messages.join(' | ');
        }
      }

      if (typeof detail === 'object') {
        return JSON.stringify(detail);
      }

      if (typeof errorPayload === 'string') {
        return errorPayload;
      }

      return `HTTP Error: ${status}`;
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const errorPayload = contentType.includes('application/json')
          ? await response.json().catch(() => null)
          : await response.text().catch(() => null);
        const message = buildErrorMessage(errorPayload, response.status);
        const error = new Error(message);
        error.payload = errorPayload;
        error.status = response.status;
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  },

  // GET request
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  },

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // PATCH request
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

export default apiClient;
