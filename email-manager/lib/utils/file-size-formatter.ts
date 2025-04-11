/**
 * Format a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "12K", "1.2MB")
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '';
  
  const units = ['B', 'K', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  // For bytes, don't show decimal places
  if (unitIndex === 0) {
    return `${Math.round(size)}${units[unitIndex]}`;
  }
  
  // For KB, show as whole number if possible
  if (unitIndex === 1 && size % 1 === 0) {
    return `${Math.round(size)}${units[unitIndex]}`;
  }
  
  // For larger sizes, show one decimal place
  return `${size.toFixed(1)}${units[unitIndex]}`;
}