export async function generateHMAC(secretKey, data) {
    // Проверка поддержки Web Crypto API
    if (!crypto.subtle) {
        throw new Error('Web Crypto API is not supported in this environment');
    }

    if (!secretKey) {
        throw new Error('Secret key is required');
    }

    try {
        const timestamp = Math.floor(Date.now() / 1000);
        const message = JSON.stringify(data) + timestamp;
        
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secretKey);
        const messageData = encoder.encode(message);

        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
        
        // Конвертируем ArrayBuffer в hex string
        const hashArray = Array.from(new Uint8Array(signature));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return { 
            hash: hashHex, 
            timestamp 
        };
        
    } catch (error) {
        console.error('HMAC generation failed:', {
            error: error.message,
            secretKeyLength: secretKey.length,
            dataType: typeof data
        });
        throw new Error(`HMAC generation failed: ${error.message}`);
    }
}