interface Window {
  phantom?: {
    solana?: {
      isPhantom?: boolean;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      signMessage(
        message: Uint8Array,
        encoding: string
      ): Promise<{ signature: Uint8Array }>;
    };
  };
}