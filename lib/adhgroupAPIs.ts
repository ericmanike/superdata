export interface ADHBalanceResponse {
  success: boolean;
  balance?: number;
  currency?: string;
  name?: string;
  timestamp?: string;
  message?: string;
  error?: string;
}

export interface ADHOrderPayload {
  type: "single" | "bulk";
  volume: number;
  phone: string;
  offerSlug: string;
  webhookUrl?: string;
}

export interface ADHOrderResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  reference?: string;
  data?: any;
  error?: string;
}

export interface ADHRestrictionsResponse {
  success: boolean;
  offers?: Array<{
    offerSlug: string;
    offerName: string;
    restrictedModeEnabled: boolean;
    whitelistModeEnabled: boolean;
    restrictionStrategy: string;
    routingLogic: string;
    routingDescription: string;
    affectedServices: string[];
    affectedNetworks: string[];
    prevalidationAvailable: boolean;
    message: string;
    configVersion: number;
  }>;
  restrictedModeEnabled?: boolean;
  restrictedOfferCount?: number;
  activeOfferCount?: number;
  message?: string;
  prevalidationAvailable?: boolean;
  affectedServices?: string[];
  affectedNetworks?: string[];
  error?: string;
}

export interface ADHValidateRecipientPayload {
  phone: string;
  network?: string;
  offerSlug: string;
  skipCache?: boolean;
}

export interface ADHValidateRecipientResponse {
  success?: boolean;
  eligible?: boolean;
  phone?: string;
  network?: string;
  offerSlug?: string;
  message?: string;
  error?: string;
  data?: any;
}

export interface ADHValidateRecipientsPayload {
  phones: string[];
  network?: string;
  offerSlug: string;
  skipCache?: boolean;
}

export interface ADHValidateRecipientsResponse {
  success?: boolean;
  results?: Array<{
    phone: string;
    eligible: boolean;
    reason?: string;
  }>;
  message?: string;
  error?: string;
  data?: any;
}

const BASE_URL = process.env.ADH_GROUP_BASE_URL || "https://www.adhgroupgh.com/api/v1";

function getHeaders(apiKey?: string): Record<string, string> {
  const key = apiKey || process.env.ADH_GROUP_API_KEY || process.env.ADH_API_KEY;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (key) {
    headers["Authorization"] = `Bearer ${key}`;
    headers["x-api-key"] = key;
  }

  return headers;
}

/**
 * Fetch current wallet balance from ADH Group API
 * GET /api/v1/balance
 */
export async function getADHBalance(apiKey?: string): Promise<ADHBalanceResponse> {
  const response = await fetch(`${BASE_URL}/balance`, {
    method: "GET",
    headers: getHeaders(apiKey),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || `HTTP error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Place single or bulk order for specified network (mtn, at, telecel)
 * POST /api/v1/order/:network
 */
export async function placeADHOrder(
  network: "mtn" | "at" | "telecel" | string,
  payload: ADHOrderPayload,
  apiKey?: string
): Promise<ADHOrderResponse> {
  const formattedNetwork = network.toLowerCase();
  const response = await fetch(`${BASE_URL}/order/${formattedNetwork}`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || `HTTP error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Get MTN restriction status and routing logic
 * GET /api/v1/restrictions
 */
export async function getADHRestrictions(
  offerSlug?: string
): Promise<ADHRestrictionsResponse> {
  const url = offerSlug
    ? `${BASE_URL}/restrictions?offerSlug=${encodeURIComponent(offerSlug)}`
    : `${BASE_URL}/restrictions`;
 
  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || `HTTP error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Validate MTN recipient (single lookup)
 * POST /api/v1/orders/validate-recipient
 */
export async function validateADHRecipient(
  payload: ADHValidateRecipientPayload,
  apiKey?: string
): Promise<ADHValidateRecipientResponse> {
  const response = await fetch(`${BASE_URL}/orders/validate-recipient`, {
    method: "POST",
    headers: getHeaders(apiKey),
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || `HTTP error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}




export interface ADHOffer {
  name: string;
  isp: string;
  type: string;
  description?: string;
  offerSlug: string;
  volumes: number[];
}

export interface ADHOffersResponse {
  success: boolean;
  offers?: ADHOffer[];
  authMethod?: string;
  message?: string;
  error?: string;
}

/**
 * Fetch available offers assigned to key's account from ADH Group API
 * GET /api/v1/offers
 */
export async function getADHOffers(apiKey?: string): Promise<ADHOffersResponse> {
  const response = await fetch(`${BASE_URL}/offers`, {
    method: "GET",
    headers: getHeaders(apiKey),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.message || errorBody.error || `HTTP error ${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}
