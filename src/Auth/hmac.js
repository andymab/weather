import CryptoJS from 'crypto-js';

export function generateHMAC(secretKey, data) {
    const timestamp = Math.floor(Date.now() / 1000); // Current timestamp
    const message = JSON.stringify(data) + timestamp; // Combine data and timestamp
    const hash = CryptoJS.HmacSHA256(message, secretKey).toString(); // Generate HMAC
    return { hash, timestamp };
}