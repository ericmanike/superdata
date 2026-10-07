export interface MoolreStatusPayload {
  type?: number;
  idtype?: string;
  id: string; // transaction ID or reference
  accountnumber?: string;
}

export interface MoolreStatusResponse {
  success?: boolean;
  status?: number | string;
  code?: number | string;
  message?: string;
  data?: any;
  error?: string;
}

export interface MoolreWebhookData {
  txstatus: number | string; // 1 (Successful), 0 (Pending), 2 (Failed)
  payer?: string;
  terminalid?: string;
  accountnumber?: string;
  name?: string;
  amount?: number | string;
  value?: number | string;
  transactionid?: number | string;
  externalref?: string;
  thirdpartyref?: string;
  secret?: string;
  ts?: string;
  [key: string]: any;
}

export interface MoolreWebhookPayload {
  status: number | string;
  code?: string;
  message?: string;
  data: MoolreWebhookData;
  go?: any;
}


/**
 * Check transaction status from Moolre API
 * POST https://api.moolre.com/open/transact/status
 */
export async function checkMoolreTransactionStatus(
  payload: MoolreStatusPayload
): Promise<MoolreStatusResponse> {
  const username = process.env.NEXT_PUBLIC_MOOLRE_USERNAME || "";
  const publicKey = process.env.NEXT_PUBLIC_MOOLRE_PK || "";
  const accountNumber = process.env.NEXT_PUBLIC_MOOLRE_ACCOUNT_NUMBER ||"";

  if (!username || !publicKey) {
    throw new Error("Moolre credentials (username/publicKey) missing in environment variables");
  }

  const baseUrl = (
    process.env.MOOLRE_BASE_URL ||
    process.env.NEXT_PUBLIC_MOOLRE_BASE_URL ||
    "https://sandbox.moolre.com"
  ).replace(/\/+$/, "");

  const response = await fetch(`${baseUrl}/open/transact/status`, {
    method: "POST",
    headers: {
      "X-API-USER": username,
      "X-API-PUBKEY": publicKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: payload.type ?? 1,
      idtype: payload.idtype ?? "2",
      id: payload.id,
      accountnumber: accountNumber,
    }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Moolre API status error (${response.status})`
    );
  }

   console.log("Moolre API status:", data);
  return data;
}

/**
 * Poll transaction status from Moolre API with retries
 * @param payload - payload with transaction ID/reference
 * @param retries - max number of retries (default 10 attempts)
 * @param delayMs - delay in ms between retries (default 2500ms = 2.5s)
 */
export async function pollMoolreTransactionStatus(
  payload: MoolreStatusPayload,
  retries: number = 10,
  delayMs: number = 2500
): Promise<MoolreStatusResponse> {
  let lastResult: MoolreStatusResponse | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Polling Moolre transaction status attempt ${attempt}/${retries} for ref [${payload.id}]...`);
      const res = await checkMoolreTransactionStatus(payload);
      lastResult = res;

      const isSuccess =
        res?.data?.txstatus === 1 ||
        res?.data?.txstatus === "1" ||
        res?.data?.txstatus === "success";

      if (isSuccess) {
        console.log(`✅ Moolre status check succeeded on attempt ${attempt}`);
        return res;
      }

      const isFailed =
        res?.data?.txstatus === 2 ||
        res?.data?.txstatus === "2" ||
        res?.data?.txstatus === "failed";
      if (isFailed) {
        console.warn(`❌ Moolre transaction explicitly marked failed on attempt ${attempt}`);
        return res;
      }
    } catch (err: any) {
      console.warn(`Attempt ${attempt} error checking Moolre status:`, err?.message || err);
    }

    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return lastResult || { status: 0, message: "Transaction status polling timed out" };
}

