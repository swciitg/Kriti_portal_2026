/**
 * Timezone Utility Functions
 * Handles timezone detection and conversion to UTC
 */

/**
 * Get the user's local timezone offset
 * @returns {string} Timezone offset in format like "IST" or "UTC"
 */
export function getLocalTimezone() {
  const offset = new Date().getTimezoneOffset();
  
  // IST is UTC+5:30, offset would be -330 minutes
  if (offset === -330) {
    return 'IST';
  }
  // UTC is 0 offset
  if (offset === 0) {
    return 'UTC';
  }
  
  // For other timezones, calculate offset
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  const sign = offset > 0 ? '-' : '+';
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Convert local datetime-local input to UTC ISO string
 * datetime-local input format: "2024-01-15T14:30"
 * @param {string} localDatetimeString - Input from datetime-local field
 * @returns {string} ISO UTC datetime string
 */
export function convertLocalToUTC(localDatetimeString) {
  if (!localDatetimeString) return '';
  
  // Parse the datetime-local format manually (YYYY-MM-DDTHH:mm)
  const [datePart, timePart] = localDatetimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);
  
  // Create a Date using constructor with individual components
  // This interprets the values as LOCAL time, not UTC
  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  
  // toISOString() automatically converts the local time to UTC representation
  return localDate.toISOString();
}

/**
 * Convert UTC ISO string to local datetime-local format for display
 * @param {string} utcDatetimeString - ISO UTC datetime string
 * @returns {string} datetime-local format (YYYY-MM-DDTHH:mm)
 */
export function convertUTCToLocalDatetimeInput(utcDatetimeString) {
  if (!utcDatetimeString) return '';
  
  const utcDate = new Date(utcDatetimeString);
  
  // Get the local date/time components
  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, '0');
  const day = String(utcDate.getDate()).padStart(2, '0');
  const hours = String(utcDate.getHours()).padStart(2, '0');
  const minutes = String(utcDate.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convert multiple datetime fields in an object to UTC
 * @param {object} payload - Object containing datetime fields
 * @param {array} datetimeFields - Array of field names to convert
 * @returns {object} New object with UTC converted datetimes
 */
export function convertPayloadDatesToUTC(payload, datetimeFields) {
  const convertedPayload = { ...payload };
  
  datetimeFields.forEach(field => {
    if (convertedPayload[field]) {
      convertedPayload[field] = convertLocalToUTC(convertedPayload[field]);
    }
  });
  
  return convertedPayload;
}
