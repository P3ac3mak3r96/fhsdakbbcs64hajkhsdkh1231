// src/utils/index.js

// Format time in seconds to MM:SS
export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date to localized string
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Calculate percentage
  export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };
  
  // Delay execution
  export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Generate unique ID
  export const generateId = () => {
    return Math.random().toString(36).substr(2, 9);
  };
  
  // Validate IP address
  export const isValidIP = (ip) => {
    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
  };
  
  // Deep clone object
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  // Debounce function
  export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  // Throttle function
  export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };
  
  // Parse query string
  export const parseQueryString = (queryString) => {
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  };
  
  // Format file size
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Validate email
  export const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // Calculate average
  export const calculateAverage = (numbers) => {
    if (!numbers.length) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  };
  
  // Format number with thousand separator
  export const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  // Check if object is empty
  export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
  };
  
  // Convert RGB to HEX
  export const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };
  
  // Convert HEX to RGB
  export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  // Color brightness calculation
  export const getColorBrightness = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    return rgb ? (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 : 0;
  };
  
  // Check if color is light or dark
  export const isLightColor = (hexColor) => {
    return getColorBrightness(hexColor) > 128;
  };