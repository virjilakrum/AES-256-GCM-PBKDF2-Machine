import React, { useState } from 'react';
import { Shield, Lock, Unlock, Key, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { encrypt, decrypt, verifyProof, EncryptionResult } from './crypto';
import { WalletButton } from './components/WalletButton';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { usePhantom } from './hooks/usePhantom';

function App() {
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [encryptedData, setEncryptedData] = useState<EncryptionResult | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  
  const { publicKey, connect, signMessage, isConnected } = usePhantom();

  const handleEncrypt = async () => {
    try {
      if (!isConnected) {
        throw new Error('Please connect your Phantom wallet first');
      }

      setIsLoading(true);
      setProcessingMessage('Requesting signature from Phantom wallet...');
      setError('');
      
      if (!message.trim() || !password.trim()) {
        throw new Error('Both message and password are required');
      }

      // Sign the message with Phantom wallet
      const signature = await signMessage(message);
      setProcessingMessage('Encrypting message...');
      
      const result = encrypt(message.trim(), password.trim(), signature);
      setEncryptedData(result);
      setVerificationStatus(null);
      setDecryptedMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed. Please try again.');
      setEncryptedData(null);
    } finally {
      setIsLoading(false);
      setProcessingMessage('');
    }
  };

  const handleDecrypt = async () => {
    try {
      if (!isConnected) {
        throw new Error('Please connect your Phantom wallet first');
      }

      setIsLoading(true);
      setProcessingMessage('Requesting signature verification...');
      setError('');
      
      if (!encryptedData || !password.trim()) {
        throw new Error('No encrypted data or password provided');
      }

      const signature = await signMessage('decrypt_' + encryptedData.ciphertext.slice(0, 32));
      setProcessingMessage('Decrypting message...');

      const result = decrypt(encryptedData, password.trim(), signature);
      if (result.success && result.message) {
        setDecryptedMessage(result.message);
      } else {
        throw new Error(result.error || 'Decryption failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed. Check your password.');
      setDecryptedMessage('');
    } finally {
      setIsLoading(false);
      setProcessingMessage('');
    }
  };

  const handleVerify = async () => {
    try {
      if (!isConnected) {
        throw new Error('Please connect your Phantom wallet first');
      }

      setIsLoading(true);
      setProcessingMessage('Verifying proof...');
      setError('');
      
      if (!encryptedData || !password.trim() || !message.trim()) {
        throw new Error('Missing required data for verification');
      }

      const signature = await signMessage('verify_' + encryptedData.proof.slice(0, 32));
      const isValid = verifyProof(encryptedData, password.trim(), message.trim(), signature);
      setVerificationStatus(isValid);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed. Please try again.');
      setVerificationStatus(null);
    } finally {
      setIsLoading(false);
      setProcessingMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#feffaf] font-['League_Spartan']">
      <ProcessingOverlay show={isLoading} message={processingMessage} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center">
            <Shield className="w-12 h-12 text-[#feffaf] mr-4" />
            <h1 className="text-4xl font-bold">zkλ zk-Encrypter Machine</h1>
          </div>
          <WalletButton
            isConnected={isConnected}
            onConnect={connect}
            address={publicKey || undefined}
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="border border-[#feffaf]/20 bg-black p-6 rounded-xl shadow-xl backdrop-blur-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-2 text-[#feffaf]" />
              Encryption
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="w-full px-4 py-2 bg-black border border-[#feffaf]/20 rounded-lg focus:ring-2 focus:ring-[#feffaf]/50 focus:outline-none text-[#feffaf]"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter your secret message"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 bg-black border border-[#feffaf]/20 rounded-lg focus:ring-2 focus:ring-[#feffaf]/50 focus:outline-none text-[#feffaf]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter encryption password"
                  disabled={isLoading}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEncrypt}
                disabled={isLoading || !isConnected}
                className={`w-full py-2 bg-[#feffaf] text-black hover:bg-[#feffaf]/90 rounded-lg font-medium transition-colors ${
                  (isLoading || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Encrypt Message'}
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="border border-[#feffaf]/20 bg-black p-6 rounded-xl shadow-xl backdrop-blur-lg"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Unlock className="w-6 h-6 mr-2 text-[#feffaf]" />
              Decryption & Verification
            </h2>
            {encryptedData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Encrypted Data</label>
                  <div className="bg-black border border-[#feffaf]/20 p-4 rounded-lg break-all text-sm">
                    <p className="mb-2">
                      <span className="text-[#feffaf]">Ciphertext:</span>{' '}
                      {encryptedData.ciphertext.slice(0, 32)}...
                    </p>
                    <p className="mb-2">
                      <span className="text-[#feffaf]">Salt:</span> {encryptedData.salt}
                    </p>
                    <p className="mb-2">
                      <span className="text-[#feffaf]">IV:</span> {encryptedData.iv}
                    </p>
                    <p className="mb-2">
                      <span className="text-[#feffaf]">Commitment:</span>{' '}
                      {encryptedData.commitment.slice(0, 32)}...
                    </p>
                    <p>
                      <span className="text-[#feffaf]">Proof:</span>{' '}
                      {encryptedData.proof.slice(0, 32)}...
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDecrypt}
                    disabled={isLoading || !isConnected}
                    className={`flex-1 py-2 bg-[#feffaf] text-black hover:bg-[#feffaf]/90 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      (isLoading || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Key className="w-4 h-4 mr-2" />
                    {isLoading ? 'Processing...' : 'Decrypt'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerify}
                    disabled={isLoading || !isConnected}
                    className={`flex-1 py-2 border border-[#feffaf] hover:bg-[#feffaf]/10 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      (isLoading || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {isLoading ? 'Processing...' : 'Verify Proof'}
                  </motion.button>
                </div>
              </div>
            )}

            {decryptedMessage && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <label className="block text-sm font-medium mb-2">Decrypted Message</label>
                <div className="bg-black border border-[#feffaf]/20 p-4 rounded-lg break-all">
                  {decryptedMessage}
                </div>
              </motion.div>
            )}

            {verificationStatus !== null && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 flex items-center"
              >
                {verificationStatus ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-green-500">Proof verified successfully!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-500">Proof verification failed!</span>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-black border border-red-500 text-red-500 px-4 py-3 rounded-lg"
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;