import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

/**
 * Generate a UUIDv4
 */
export const generateId = (): string => uuidv4();

/**
 * Generate a random reference string for MoMo payments
 */
export const generateMoMoReference = (): string => {
  return `PASS_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
};

/**
 * Generate QR Code as Base64
 */
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCode = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Format currency (convert cents to euros/dollars)
 */
export const formatCurrency = (amountInCents: number, currency: string = 'EUR'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  return formatter.format(amountInCents / 100);
};

/**
 * Convert currency to cents
 */
export const toCents = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone format (flexible international format)
 * Accepts formats like: 0693456789, 064836012, +2370693456789, +242064836012, etc.
 */
export const validatePhone = (phone: string): boolean => {
  // Remove all non-digits and count them
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Accept phone numbers with 8-15 digits
  // This covers most international formats
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return true;
  }
  
  return false;
};
