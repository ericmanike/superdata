import { placeADHOrder } from "./adhgroupAPIs";

export async function handleDakazina(order: any, data: any, apiKey: string) {
  let networkId;

  if (data.network === "MTN") networkId = 3;
  else if (data.network === "TELECEL") networkId = 2;
  else if (data.network.startsWith("AT")) networkId = 4;
  else throw new Error("Invalid network");

  const res = await fetch(
    "https://reseller.dakazinabusinessconsult.com/api/v1/buy-data-package",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        recipient_msisdn: data.phoneNumber.trim(),
        network_id: networkId,
        shared_bundle: Number(data.bundleName),
        incoming_api_ref: data.reference,
      }),
    }
  );

  const result = await res.json();

  if (result.transaction_code) {
    order.transaction_id = result.transaction_code;
    order.status = "processing";
    await order.save();
  }
  console.log('Dakazina result:', result);
  return result;
}

export async function handleADHGroup(order: any, data: any, apiKey?: string) {
  let adhNetwork = "mtn";
  let offerSlug = "mtn_data_bundle";
  const upperNet = (data.network || "").toUpperCase();

  if (upperNet === "MTN") {
    adhNetwork = "mtn";
    offerSlug = "mtn_data_bundle";
  } else if (upperNet === "TELECEL") {
    adhNetwork = "telecel";
    offerSlug = "telecel_data_bundle";
  } else if (upperNet.startsWith("AT") || upperNet.includes("AIRTEL")) {
    adhNetwork = "at";
    offerSlug = "at_data_bundle";
  }

  const volume = Number(data.bundleName);

  const res = await placeADHOrder(
    adhNetwork,
    {
      type: "single",
      volume: volume,
      phone: data.phoneNumber.trim(),
      offerSlug: offerSlug,
    },
    apiKey
  );

  if (res.success || res.orderId || res.reference) {
    order.transaction_id = res.orderId || res.reference || `adh_${Date.now()}`;
    order.status = "processing";
    await order.save();
  }

  console.log("ADH Group result:", res);
  return res;
}
