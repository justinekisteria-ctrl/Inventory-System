// frontend/src/services/api.js
// API communication layer - all backend requests go through here

import axios from 'axios';

// Base URL for backend API
const API_BASE_URL = 'https://inventory-system-backend-yvkv.onrender.com/api';

// For local development, use:
// const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:2026/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});



apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Upload Excel file to backend
 * @param {File} file - The Excel file to upload
 * @returns {Promise<Object>} - Upload response with statistics
 */
export async function uploadExcelFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Upload failed' };
  }
}

/**
 * Fetch all assets from backend
 * @returns {Promise<Object>} - All assets and statistics
 */
export async function fetchAssets() {
  try {
    const response = await apiClient.get('/assets');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch assets' };
  }
}

/**
 * Remove all assets from the current inventory list
 * @returns {Promise<Object>} - Clear response
 */
export async function clearAssets() {
  try {
    const response = await apiClient.delete('/assets');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to clear assets' };
  }
}

/**
 * Add a newly scanned asset to the inventory
 * @param {Object} assetDetails - New asset details entered by the user
 * @returns {Promise<Object>} - Created asset response
 */
export async function addAsset(assetDetails) {
  try {
    const response = await apiClient.post('/assets', assetDetails);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add asset' };
  }
}

/**
 * Send scanned QR code data to backend
 * @param {string} scannedValue - The value from scanned QR code
 * @returns {Promise<Object>} - Updated asset information
 */
export async function processScan(
  scannedValue,
  scanMethod = 'QR'
) {
  try {
    const response = await apiClient.post('/scan', {
      scannedValue,
      scanMethod,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Scan processing failed' };
  }
}

/**
 * Download updated Excel file
 * Triggers automatic download in browser
 */
export async function downloadExcel() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/download`,
      {
        responseType: 'blob', // Important: receive as binary file
      }
    );

    // Create a blob and trigger download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Create temporary link and download
    const disposition = response.headers['content-disposition'];
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filenameMatch?.[1] || 'AssetInventoryReport.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    throw { message: 'Failed to download file' };
  }
}

/**
 * Validate user login
 */
export async function loginUser(credentials) {
  try {
    const response = await apiClient.post('/users/login', credentials);
    return response.data;
  } catch (error) {

  throw new Error(
    error.response?.data?.message ||
    'Access denied. Your Employee ID and Department are not registered by the administrator.'
  );

}
}

export async function fetchActivityHistory() {
  try {
    const response =
      await apiClient.get(
        '/activity-history'
      );

    return response.data.history || [];
  } catch (error) {
    throw (
      error.response?.data || {
        message:
          'Failed to fetch activity history',
      }
    );
  }
}

export async function getLastUpdated() {
  try {
    const response = await apiClient.get('/last-updated');
    return response.data.lastUpdated;
  } catch (error) {
    return null;
  }
}

export async function
downloadActivityReport() {

  try {

    const response =
  await apiClient.get(
        '/download/activity-report',
        {
          responseType: 'blob',
        }
      );

    const blob = new Blob(
      [response.data],
      {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    );

    const disposition =
      response.headers[
        'content-disposition'
      ];

    const filenameMatch =
      disposition?.match(
        /filename="?([^"]+)"?/i
      );

    const link =
      document.createElement('a');

    link.href =
      window.URL.createObjectURL(
        blob
      );

    link.download =
      filenameMatch?.[1] ||
      'ActivityReport.xlsx';

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    window.URL.revokeObjectURL(
      link.href
    );

  } catch (error) {

    throw {
      message:
        'Failed to download activity report',
    };

  }

}

export async function updateAsset(
  assetNumber,
  updates
) {

  try {

    const response =
      await apiClient.put(
        `/assets/${assetNumber}`,
        updates
      );

    return response.data;

  } catch (error) {

    throw (
      error.response?.data || {
        message:
          'Failed to update asset',
      }
    );

  }

}

export default apiClient;
