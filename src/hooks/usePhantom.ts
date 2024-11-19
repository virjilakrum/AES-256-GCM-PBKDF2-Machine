import { useState, useEffect, useCallback } from 'react';
import { Buffer as BufferPolyfill } from 'buffer';

// Ensure Buffer is available globally
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || BufferPolyfill;
}

export const usePhantom = () => {
  const [phantom, setPhantom] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);

  useEffect(() => {
    if ('phantom' in window) {
      const provider = window.phantom?.solana;
      if (provider?.isPhantom) {
        setPhantom(provider);
        
        if (provider.isConnected) {
          provider.connect({ onlyIfTrusted: true })
            .then((response: any) => {
              setPublicKey(response.publicKey.toString());
            })
            .catch(() => {
              // Silent catch - user may not have trusted this app yet
            });
        }
      }
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      if (!phantom) throw new Error('Phantom wallet not found!');
      const response = await phantom.connect();
      setPublicKey(response.publicKey.toString());
      return response.publicKey.toString();
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      throw error;
    }
  }, [phantom]);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    try {
      if (!phantom || !publicKey) throw new Error('Wallet not connected');

      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await phantom.signMessage(encodedMessage, 'utf8');
      
      return BufferPolyfill.from(signedMessage.signature).toString('hex');
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to sign message');
    }
  }, [phantom, publicKey]);

  return {
    phantom,
    publicKey,
    connect,
    signMessage,
    isConnected: !!publicKey
  };
};