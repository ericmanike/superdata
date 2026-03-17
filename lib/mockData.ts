export type Network = "MTN" | "Telecel" | "AirtelTigo";

export interface Bundle {
  id: string;
  network: Network;
  size: string;
  price: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  walletBalance: number;
}

export type OrderStatus = "Pending" | "Processing" | "Delivered" | "Failed";

export interface Order {
  id: string;
  userId: string;
  bundleId: string;
  phone: string;
  status: OrderStatus;
  date: string;
  network: Network;
  bundle: string;
  amount: number;
  transactionId?: string;
}

export type TransactionStatus = "Success" | "Pending" | "Failed";

export interface Transaction {
  id: string;
  userId: string;
  network: Network;
  phone: string;
  bundle: string;
  amount: number;
  status: TransactionStatus;
  date: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

const usersData: User[] = [
  {
    id: "USR-1001",
    name: "Ama Boateng",
    email: "ama@example.com",
    phone: "024 123 4567",
    walletBalance: 420.5,
  },
  {
    id: "USR-1002",
    name: "Kwesi Mensah",
    email: "kwesi@example.com",
    phone: "020 987 2211",
    walletBalance: 180,
  },
];

const bundlesData: Bundle[] = [
  { id: "b1", network: "MTN", size: "1.5 GB", price: 8 },
  { id: "b2", network: "MTN", size: "3 GB", price: 14 },
  { id: "b3", network: "AirtelTigo", size: "5 GB", price: 22 },
  { id: "b4", network: "Telecel", size: "10 GB", price: 38 },
];

const ordersData: Order[] = [
  {
    id: "ORD-9901",
    userId: usersData[0].id,
    bundleId: "b4",
    phone: "024 111 2222",
    status: "Delivered",
    date: "2026-03-09T17:12:00Z",
    network: "Telecel",
    bundle: "10 GB",
    amount: 38,
  },
  {
    id: "ORD-9900",
    userId: usersData[1].id,
    bundleId: "b1",
    phone: "027 555 1001",
    status: "Processing",
    date: "2026-03-10T07:40:00Z",
    network: "MTN",
    bundle: "1.5 GB",
    amount: 8,
  },
  {
    id: "ORD-9899",
    userId: usersData[1].id,
    bundleId: "b3",
    phone: "020 987 2211",
    status: "Delivered",
    date: "2026-03-08T12:00:00Z",
    network: "AirtelTigo",
    bundle: "5 GB",
    amount: 22,
  },
];

const transactionsData: Transaction[] = [
  {
    id: "TX-45821",
    userId: usersData[0].id,
    network: "MTN",
    phone: "024 123 4567",
    bundle: "3 GB",
    amount: 14,
    status: "Success",
    date: "2026-03-10T08:10:00Z",
  },
  {
    id: "TX-45820",
    userId: usersData[1].id,
    network: "AirtelTigo",
    phone: "020 987 2211",
    bundle: "5 GB",
    amount: 22,
    status: "Pending",
    date: "2026-03-10T07:45:00Z",
  },
  {
    id: "TX-45819",
    userId: usersData[0].id,
    network: "Telecel",
    phone: "027 555 1001",
    bundle: "10 GB",
    amount: 38,
    status: "Success",
    date: "2026-03-09T18:20:00Z",
  },
];

export const wallet: Wallet = {
  userId: usersData[0].id,
  balance: 420.5,
  currency: "GHS",
  lastUpdated: "2026-03-10T08:30:00Z",
};

export const users = usersData;
export const bundles = bundlesData;
export const orders = ordersData;
export const transactions = transactionsData;

const networks: Network[] = ["MTN", "Telecel", "AirtelTigo"];

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function createUser(params: {
  name: string;
  email: string;
  phone: string;
  walletBalance?: number;
}): User {
  const { name, email, phone, walletBalance = 0 } = params;
  const user: User = {
    id: makeId("USR"),
    name,
    email,
    phone,
    walletBalance,
  };
  usersData.unshift(user);
  return user;
}

export function createOrder(params: {
  userId: string;
  bundleId: string;
  phone?: string;
}): Order {
  const user = usersData.find((u) => u.id === params.userId);
  const bundle = bundlesData.find((b) => b.id === params.bundleId);

  if (!user) {
    throw new Error("User not found");
  }

  if (!bundle) {
    throw new Error("Bundle not found");
  }

  const order: Order = {
    id: makeId("ORD"),
    userId: user.id,
    bundleId: bundle.id,
    phone: params.phone ?? user.phone,
    status: "Processing",
    date: new Date().toISOString(),
    network: bundle.network,
    bundle: bundle.size,
    amount: bundle.price,
  };

  ordersData.unshift(order);

  transactionsData.unshift({
    id: makeId("TX"),
    userId: user.id,
    network: bundle.network,
    phone: order.phone,
    bundle: bundle.size,
    amount: bundle.price,
    status: "Pending",
    date: order.date,
  });

  wallet.balance = Math.max(0, wallet.balance - bundle.price);
  wallet.lastUpdated = order.date;

  return order;
}

export function createBundle(params: {
  network: Network;
  size: string;
  price: number;
}): Bundle {
  if (!networks.includes(params.network)) {
    throw new Error("Unsupported network");
  }

  const bundle: Bundle = {
    id: makeId("BND"),
    network: params.network,
    size: params.size,
    price: params.price,
  };

  bundlesData.push(bundle);
  return bundle;
}
