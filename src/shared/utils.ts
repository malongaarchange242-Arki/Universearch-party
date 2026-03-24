import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import * as crypto from 'crypto';

// Encryption key from environment (must be 32 chars for AES-256)
const ENCRYPTION_KEY = (process.env.QR_ENCRYPTION_KEY || 'universeach-secure-key-2026-pass').padEnd(32, '0').substring(0, 32);

/**
 * Encrypt QR code data (AES-256-GCM)
 */
export const encryptQRData = (data: string): string => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encrypted (all in hex)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Error encrypting QR data:', error);
    throw new Error('Failed to encrypt QR data');
  }
};

/**
 * Decrypt QR code data (AES-256-GCM)
 */
export const decryptQRData = (encryptedData: string): string => {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) throw new Error('Invalid encrypted data format');
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting QR data:', error);
    throw new Error('Failed to decrypt QR data - ticket may be invalid or tampered');
  }
};

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
 * Generate QR Code as Base64 with encrypted data
 */
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    // Encrypt the data before putting it in QR code
    const encryptedData = encryptQRData(data);
    
    const qrCode = await QRCode.toDataURL(encryptedData, {
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
