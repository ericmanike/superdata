export const wallet = {
  balance: 420.5,
  currency: "GHS",
  lastUpdated: "2026-03-10T08:30:00Z",
};

export const transactions = [
  {
    id: "TX-45821",
    network: "MTN",
    phone: "024 123 4567",
    bundle: "3 GB",
    amount: 14,
    status: "Success",
    date: "2026-03-10T08:10:00Z",
  },
  {
    id: "TX-45820",
    network: "Telecel",
    phone: "020 987 2211",
    bundle: "5 GB",
    amount: 22,
    status: "Pending",
    date: "2026-03-10T07:45:00Z",
  },
  {
    id: "TX-45819",
    network: "AirtelTigo",
    phone: "027 555 1001",
    bundle: "10 GB",
    amount: 38,
    status: "Success",
    date: "2026-03-09T18:20:00Z",
  },
];

export const orders = [
  {
    id: "ORD-9901",
    network: "MTN",
    bundle: "10 GB",
    phone: "024 111 2222",
    status: "Delivered",
    date: "2026-03-09T17:12:00Z",
  },
  {
    id: "ORD-9900",
    network: "AirtelTigo",
    bundle: "3 GB",
    phone: "027 555 1001",
    status: "Processing",
    date: "2026-03-10T07:40:00Z",
  },
  {
    id: "ORD-9899",
    network: "Telecel",
    bundle: "5 GB",
    phone: "020 987 2211",
    status: "Delivered",
    date: "2026-03-08T12:00:00Z",
  },
];

export const bundles = [
  { id: "b1", network: "MTN", size: "1.5 GB", price: 8 },
  { id: "b2", network: "MTN", size: "3 GB", price: 14 },
  { id: "b3", network: "AirtelTigo", size: "5 GB", price: 22 },
  { id: "b4", network: "Telecel", size: "10 GB", price: 38 },
];
