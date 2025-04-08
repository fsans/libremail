/**
 * Parse email addresses from a string
 * @param addressString String containing email addresses (e.g., "John Doe <john@example.com>, jane@example.com")
 * @returns Array of parsed email addresses with name and address
 */
export function parseEmailAddresses(addressString: string = '') {
  if (!addressString) return [];
  
  const addresses: { name: string; address: string }[] = [];
  const regex = /(?:"?([^"]*)"?\s)?(?:<)?([^@<\s]+@[^@>\s]+)(?:>)?/g;
  let match;
  
  while ((match = regex.exec(addressString)) !== null) {
    const [, name, address] = match;
    addresses.push({
      name: name?.trim() || '',
      address: address.trim()
    });
  }
  
  return addresses;
}

/**
 * Format email addresses for display
 * @param addresses Array of email addresses
 * @returns Formatted string of email addresses
 */
export function formatEmailAddresses(
  addresses: { name: string; address: string }[]
): string {
  return addresses
    .map(({ name, address }) => {
      if (name) {
        return `${name} <${address}>`;
      }
      return address;
    })
    .join(', ');
}

/**
 * Extract plain text from HTML
 * @param html HTML content
 * @returns Plain text content
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  
  // Simple HTML to text conversion
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Get initials from a name
 * @param name Full name
 * @returns Initials (up to 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return '';
  
  const parts = name.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Create a color from a string (for avatar backgrounds)
 * @param str Input string
 * @returns Hex color code
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}