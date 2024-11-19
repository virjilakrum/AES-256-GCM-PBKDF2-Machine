import CryptoJS from 'crypto-js';

export interface EncryptionResult {
  ciphertext: string;
  salt: string;
  iv: string;
  commitment: string;
  proof: string;
}

const generateKey = (password: string, salt: string): CryptoJS.lib.WordArray => {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256
  });
};

const createCommitment = (message: string, randomness: string, signature: string): string => {
  const combined = message + randomness + signature;
  return CryptoJS.SHA256(combined).toString();
};

export const encrypt = (message: string, password: string, signature: string): EncryptionResult => {
  try {
    if (!message || !password || !signature) {
      throw new Error('Message, password, and signature are required');
    }

    const salt = CryptoJS.lib.WordArray.random(16).toString();
    const iv = CryptoJS.lib.WordArray.random(16).toString();
    const key = generateKey(password, salt);
    const randomness = CryptoJS.lib.WordArray.random(32).toString();

    const commitment = createCommitment(message, randomness, signature);

    const encrypted = CryptoJS.AES.encrypt(message, key.toString(), {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const challenge = CryptoJS.SHA256(commitment + encrypted.toString() + signature).toString();
    const proof = CryptoJS.HmacSHA256(challenge + randomness + signature, key.toString()).toString();

    return {
      ciphertext: encrypted.toString(),
      salt,
      iv,
      commitment,
      proof
    };
  } catch (error) {
    throw new Error('Encryption failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const decrypt = (
  encryptedData: EncryptionResult,
  password: string,
  signature: string
): { success: boolean; message?: string; error?: string } => {
  try {
    if (!encryptedData || !password || !signature) {
      throw new Error('Encrypted data, password, and signature are required');
    }

    const key = generateKey(password, encryptedData.salt);
    
    const decrypted = CryptoJS.AES.decrypt(
      encryptedData.ciphertext,
      key.toString(),
      {
        iv: CryptoJS.enc.Hex.parse(encryptedData.iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      }
    );

    const decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedMessage) {
      throw new Error('Decryption resulted in empty message');
    }

    return {
      success: true,
      message: decryptedMessage
    };
  } catch (error) {
    return {
      success: false,
      error: 'Decryption failed: Invalid password or corrupted data'
    };
  }
};

export const verifyProof = (
  encryptedData: EncryptionResult,
  password: string,
  originalMessage: string,
  signature: string
): boolean => {
  try {
    if (!encryptedData || !password || !originalMessage || !signature) {
      return false;
    }

    const key = generateKey(password, encryptedData.salt);
    
    const challenge = CryptoJS.SHA256(
      encryptedData.commitment + encryptedData.ciphertext + signature
    ).toString();

    const decrypted = decrypt(encryptedData, password, signature);
    if (!decrypted.success || decrypted.message !== originalMessage) {
      return false;
    }

    const expectedProof = CryptoJS.HmacSHA256(
      challenge + key.toString() + signature,
      key.toString()
    ).toString();

    return CryptoJS.SHA256(encryptedData.proof).toString() === 
           CryptoJS.SHA256(expectedProof).toString();
  } catch {
    return false;
  }
};