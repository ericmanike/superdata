declare module "@moolre/moolrejs" {
  export interface MoolreCheckoutOptions {
    username?: string;
    publicKey?: string;
    accountNumber?: string;
    amount: number;
    email: string;
    externalRef: string;
    currency?: string;
    metadata?: Record<string, any>;
    callbackUrl?: string;
    redirectUrl?: string;
    mode?: string;
    reusable?: boolean;
    iframeHeight?: string;
    allowedOrigins?: string[];
    paymentUrl?: string;
    onLoad?: () => void;
    onSuccess?: (transaction: any) => void;
    onError?: (error: any) => void;
    onCancel?: () => void;
    onClose?: () => void;
  }

  export default class MoolrePay {
    constructor(options?: {
      username?: string;
      publicKey?: string;
      accountNumber?: string;
    });

    setup(options: {
      username?: string;
      publicKey?: string;
      accountNumber?: string;
    }): void;

    checkout(options: MoolreCheckoutOptions): Promise<void>;

    preloadTransaction(
      options: MoolreCheckoutOptions
    ): Promise<() => void>;
  }
}
