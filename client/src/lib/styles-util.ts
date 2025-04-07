// Utility functions for working with styles

/**
 * Get a CSS variable value from the document
 * @param variableName The CSS variable name without the -- prefix
 * @param defaultValue Optional default value to return if the variable is not found
 * @returns The CSS variable value or the default value
 */
export function getCssVar(variableName: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') return defaultValue;
  
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${variableName}`)
    .trim();
    
  return value || defaultValue;
}

/**
 * Set a CSS variable value in the document
 * @param variableName The CSS variable name without the -- prefix
 * @param value The value to set
 */
export function setCssVar(variableName: string, value: string): void {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(`--${variableName}`, value);
}

/**
 * Apply a batch of CSS variables to the document
 * @param variables Record of variable names to values
 */
export function applyStyleVariables(variables: Record<string, string>): void {
  if (typeof window === 'undefined') return;
  
  Object.entries(variables).forEach(([name, value]) => {
    setCssVar(name, value);
  });
}

/**
 * Convert a hex color to rgba
 * @param hex The hex color code (with or without # prefix)
 * @param alpha The alpha value (0-1)
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  let cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
  
  // Convert shorthand hex to full format
  if (cleanHex.length === 3) {
    cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
  }
  
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Check if a color is dark or light
 * @param color The hex color code (with or without # prefix)
 * @returns true if the color is dark, false if it's light
 */
export function isColorDark(color: string): boolean {
  // Remove # if present
  const hex = color.startsWith('#') ? color.slice(1) : color;
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate perceived brightness using the formula: (0.299*R + 0.587*G + 0.114*B)
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  
  // Return true if the color is dark (brightness < 0.5)
  return brightness < 0.5;
}