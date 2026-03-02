/**
 * LocalStorage - Safe wrapper for browser localStorage
 * Handles JSON serialization and error handling
 */

/**
 * Saves data to localStorage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON serialized)
 * @returns {boolean} Success status
 */
export function save(key, value) {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error('LocalStorage save error:', error);
    return false;
  }
}

/**
 * Loads data from localStorage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Stored value or default
 */
export function load(key, defaultValue = null) {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    const item = localStorage.getItem(key);

    if (item === null) {
      return defaultValue;
    }

    return JSON.parse(item);
  } catch (error) {
    console.error('LocalStorage load error:', error);
    return defaultValue;
  }
}

/**
 * Removes data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function remove(key) {
  try {
    if (!key || typeof key !== 'string') {
      throw new Error('Key must be a non-empty string');
    }

    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('LocalStorage remove error:', error);
    return false;
  }
}

/**
 * Clears all data from localStorage
 * @returns {boolean} Success status
 */
export function clear() {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('LocalStorage clear error:', error);
    return false;
  }
}

/**
 * Checks if key exists in localStorage
 * @param {string} key - Storage key
 * @returns {boolean} True if key exists
 */
export function has(key) {
  try {
    if (!key || typeof key !== 'string') {
      return false;
    }

    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error('LocalStorage has error:', error);
    return false;
  }
}

/**
 * Gets all keys in localStorage
 * @returns {Array<string>} Array of keys
 */
export function keys() {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error('LocalStorage keys error:', error);
    return [];
  }
}

/**
 * Gets localStorage size in bytes (approximate)
 * @returns {number} Size in bytes
 */
export function size() {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    console.error('LocalStorage size error:', error);
    return 0;
  }
}

/**
 * Checks if localStorage is available
 * @returns {boolean} True if available
 */
export function isAvailable() {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}
