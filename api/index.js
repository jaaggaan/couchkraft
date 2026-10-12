// server/auth-middleware.ts
import { createHmac as createHmac2 } from "node:crypto";
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";

// server/auth-store.ts
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve as resolve2 } from "node:path";
import bcrypt from "bcryptjs";

// server/data-path.ts
import { tmpdir } from "node:os";
import { resolve } from "node:path";
function dataDirectory() {
  if (process.env.VERCEL) return resolve(tmpdir(), "couchkraft-data");
  return resolve(process.cwd(), "data");
}

// server/auth-store.ts
var dataDir = dataDirectory();
var storePath = resolve2(dataDir, "customers.json");
function ensureStore() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  if (!existsSync(storePath)) writeFileSync(storePath, "[]", "utf8");
}
function readAll() {
  ensureStore();
  try {
    const rows = JSON.parse(readFileSync(storePath, "utf8"));
    return rows.map((customer) => ({ ...customer, addresses: customer.addresses ?? [] }));
  } catch {
    return [];
  }
}
function writeAll(customers) {
  ensureStore();
  writeFileSync(storePath, JSON.stringify(customers, null, 2), "utf8");
}
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}
function newToken() {
  return randomBytes(32).toString("hex");
}
function tokensMatch(token, hash) {
  if (!hash) return false;
  const left = Buffer.from(hashToken(token));
  const right = Buffer.from(hash);
  return left.length === right.length && timingSafeEqual(left, right);
}
function findByEmail(email) {
  return readAll().find((customer) => customer.email === email.toLowerCase().trim()) ?? null;
}
function findById(id) {
  return readAll().find((customer) => customer.id === id) ?? null;
}
function publicCustomer(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    emailVerified: customer.emailVerified
  };
}
async function createCustomer(input) {
  const customers = readAll();
  const email = input.email.toLowerCase().trim();
  if (customers.some((customer2) => customer2.email === email)) {
    return { error: "duplicate" };
  }
  const verifyToken = newToken();
  const customer = {
    id: randomBytes(12).toString("hex"),
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash: await bcrypt.hash(input.password, 12),
    emailVerified: false,
    verifyTokenHash: hashToken(verifyToken),
    verifyExpires: Date.now() + 1e3 * 60 * 60 * 24,
    resetTokenHash: null,
    resetExpires: null,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    addresses: []
  };
  customers.push(customer);
  writeAll(customers);
  return { customer, verifyToken };
}
function saveCustomer(updated) {
  const customers = readAll().map((customer) => customer.id === updated.id ? updated : customer);
  writeAll(customers);
}
function updateProfile(customer, input) {
  const email = input.email.toLowerCase().trim();
  const taken = findByEmail(email);
  if (taken && taken.id !== customer.id) return { error: "duplicate" };
  const next = {
    ...customer,
    name: input.name.trim(),
    email,
    phone: input.phone.trim()
  };
  saveCustomer(next);
  return { customer: next };
}
function issueVerifyToken(customer) {
  const verifyToken = newToken();
  saveCustomer({
    ...customer,
    verifyTokenHash: hashToken(verifyToken),
    verifyExpires: Date.now() + 1e3 * 60 * 60 * 24
  });
  return verifyToken;
}
function issueResetToken(customer) {
  const resetToken = newToken();
  saveCustomer({
    ...customer,
    resetTokenHash: hashToken(resetToken),
    resetExpires: Date.now() + 1e3 * 60 * 30
  });
  return resetToken;
}
function findByVerifyToken(token) {
  return readAll().find((customer) => tokensMatch(token, customer.verifyTokenHash)) ?? null;
}
function findByResetToken(token) {
  return readAll().find((customer) => tokensMatch(token, customer.resetTokenHash)) ?? null;
}
async function setPassword(customer, password) {
  saveCustomer({
    ...customer,
    passwordHash: await bcrypt.hash(password, 12),
    resetTokenHash: null,
    resetExpires: null
  });
}
function addAddress(customer, input) {
  const address = { ...input, id: randomBytes(8).toString("hex") };
  saveCustomer({ ...customer, addresses: [...customer.addresses, address] });
  return address;
}
function updateAddress(customer, addressId, input) {
  const addresses = customer.addresses.map((address) => address.id === addressId ? { ...input, id: addressId } : address);
  if (!addresses.some((address) => address.id === addressId)) return null;
  saveCustomer({ ...customer, addresses });
  return addresses.find((address) => address.id === addressId) ?? null;
}
function removeAddress(customer, addressId) {
  if (!customer.addresses.some((address) => address.id === addressId)) return false;
  saveCustomer({ ...customer, addresses: customer.addresses.filter((address) => address.id !== addressId) });
  return true;
}

// server/order-store.ts
import { randomBytes as randomBytes2 } from "node:crypto";
import { existsSync as existsSync2, mkdirSync as mkdirSync2, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from "node:fs";
import { resolve as resolve3 } from "node:path";

// src/data/products.ts
var img = (id, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
var products = [
  {
    id: "ck-arden-sofa",
    slug: "arden-three-seater-sofa",
    name: "Arden Three-Seater Sofa",
    price: 148e3,
    description: "A low, generously proportioned sofa in cream upholstery. Soft seating, a quiet oak frame and the kind of silhouette that belongs in a sunlit living room.",
    category: "Sofa",
    space: "living",
    tabs: ["bestsellers", "classics", "sets"],
    images: [
      img("photo-1567016432779-094069958ea5"),
      img("photo-1631679706909-1844bbd07221"),
      img("photo-1554995207-c18c203602cb"),
      img("photo-1493663284031-b7e3aefcae8e")
    ],
    finishes: ["Cream boucl\xE9", "Warm oat linen"],
    care: "Vacuum regularly. Professional clean only."
  },
  {
    id: "ck-luma-chair",
    slug: "luma-lounge-chair",
    name: "Luma Lounge Chair",
    price: 42e3,
    description: "An open oak frame with a deep, cushioned seat. Designed for reading, conversation and the slower hours of the day.",
    category: "Chair",
    space: "lounge",
    tabs: ["bestsellers", "new"],
    images: [
      img("photo-1567538096630-e0c55bd6374c"),
      img("photo-1592078615290-033ee584e267"),
      img("photo-1580480055273-228ff5388ef8"),
      img("photo-1544457070-4cd773b4d71e")
    ],
    finishes: ["Natural oak", "Walnut stain"],
    care: "Dust the frame with a dry cloth. Keep out of prolonged direct sun."
  },
  {
    id: "ck-nordic-sideboard",
    slug: "nordic-walnut-sideboard",
    name: "Nordic Walnut Sideboard",
    price: 98e3,
    description: "A three-drawer walnut sideboard with a quiet grain and a low, architectural profile. Storage that reads as furniture, not cabinetry.",
    category: "Storage",
    space: "living",
    tabs: ["bestsellers", "classics"],
    images: [
      img("photo-1611967164521-abae8fba4668"),
      img("photo-1600585154526-990dced4db0d"),
      img("photo-1600566753086-00f18fb6b3ea"),
      img("photo-1556228453-efd6c1ff04f6")
    ],
    finishes: ["Walnut"],
    care: "Wipe with a slightly damp cloth. Use coasters on the top surface."
  },
  {
    id: "ck-solene-daybed",
    slug: "solene-upholstered-daybed",
    name: "Solene Upholstered Daybed",
    price: 89e3,
    description: "A slender daybed in oatmeal linen. Equally at home as a sofa, a guest bed or a quiet place to rest by a window.",
    category: "Daybed",
    space: "bedroom",
    tabs: ["new", "classics"],
    images: [
      img("photo-1505693416388-ac5ce068fe85"),
      img("photo-1540518614846-7eded433c457"),
      img("photo-1522771739844-6a9f6d5f14af"),
      img("photo-1615873968403-89e068629265")
    ],
    finishes: ["Oatmeal linen"],
    care: "Rotate cushions periodically. Professional clean only."
  },
  {
    id: "ck-mira-mirror",
    slug: "mira-wall-mirror",
    name: "Mira Wall Mirror",
    price: 24e3,
    description: "A round oak-framed mirror with a thin, tactile rim. A simple way to lift light across a hallway, dining room or dressing space.",
    category: "Mirror",
    space: "lounge",
    tabs: ["bestsellers", "new", "sets"],
    images: [
      img("photo-1616046229478-9901c5536a45"),
      img("photo-1578500494198-246f612d3b3d"),
      img("photo-1618220179428-22790b461013"),
      img("photo-1600210491892-03d54c0aaf87")
    ],
    finishes: ["Natural oak"],
    care: "Clean glass with a non-abrasive cloth."
  },
  {
    id: "ck-theo-table",
    slug: "theo-coffee-table",
    name: "Theo Coffee Table",
    price: 36e3,
    description: "A two-tier oak coffee table with a calm, rectilinear plan. Open storage below for books, trays and the objects of everyday living.",
    category: "Table",
    space: "living",
    tabs: ["bestsellers", "sets", "classics"],
    images: [
      img("photo-1533090481720-856c6e3c1fdc"),
      img("photo-1611269154421-4e27233ac5c7"),
      img("photo-1600121848594-d8644e57abab"),
      img("photo-1616137466211-f939a420be84")
    ],
    finishes: ["Natural oak"],
    care: "Use felt pads. Avoid standing water on the surface."
  },
  {
    id: "ck-theo-dining-chair",
    slug: "theo-oak-chair",
    name: "Theo Oak Chair",
    price: 18e3,
    description: "A sculpted oak dining chair with a curved backrest. Light enough to move, considered enough to keep.",
    category: "Chair",
    space: "dining",
    tabs: ["new", "sets"],
    images: [
      img("photo-1503602642458-232111445657"),
      img("photo-1544457070-4cd773b4d71e"),
      img("photo-1592078615290-033ee584e267"),
      img("photo-1580480055273-228ff5388ef8")
    ],
    finishes: ["Natural oak"],
    care: "Wipe after meals. Tighten joinery once a year."
  },
  {
    id: "ck-haven-bed",
    slug: "haven-upholstered-bed",
    name: "Haven Upholstered Bed",
    price: 126e3,
    compareAt: 142e3,
    description: "A low upholstered bed with a generous headboard. Soft structure, quiet colour and a silhouette made for unhurried mornings.",
    category: "Bed",
    space: "bedroom",
    tabs: ["new", "classics"],
    images: [
      img("photo-1540518614846-7eded433c457"),
      img("photo-1615876234886-fd9a39fda97f"),
      img("photo-1522771739844-6a9f6d5f14af"),
      img("photo-1615873968403-89e068629265")
    ],
    finishes: ["Warm oat", "Stone linen"],
    care: "Spot clean fabric. Professional clean for the headboard."
  },
  {
    id: "ck-orb-pendant",
    slug: "orb-pendant-light",
    name: "Orb Pendant Light",
    price: 16e3,
    description: "A dark, dome pendant that gathers light over a table or daybed. Understated, architectural and easy to live with.",
    category: "Lighting",
    space: "dining",
    tabs: ["new"],
    images: [
      img("photo-1513506003901-1e6a229e2d15"),
      img("photo-1600607687939-ce8a6c25118c"),
      img("photo-1550254478-ead40cc54513"),
      img("photo-1600566753190-17f0baa2a6c3")
    ],
    finishes: ["Matte charcoal"],
    care: "Disconnect power before cleaning. Dust with a dry cloth."
  },
  {
    id: "ck-linen-ottoman",
    slug: "linen-ottoman",
    name: "Linen Ottoman",
    price: 22e3,
    description: "A compact upholstered ottoman in warm linen. Use as a footrest, extra seat or a low table with a tray.",
    category: "Ottoman",
    space: "lounge",
    tabs: ["bestsellers", "sets"],
    images: [
      img("photo-1540574163026-643ea20ade25"),
      img("photo-1484101403633-562f891dc89a"),
      img("photo-1586023492125-27b2c045efd7"),
      img("photo-1550254478-ead40cc54513")
    ],
    finishes: ["Warm oat linen"],
    care: "Vacuum the fabric. Rotate to even the wear."
  }
];

// src/data/site.ts
var DEMO_COUPON = {
  code: "WARM10",
  percent: 10
};

// server/order-store.ts
var dataDir2 = dataDirectory();
var storePath2 = resolve3(dataDir2, "orders.json");
function ensureStore2() {
  if (!existsSync2(dataDir2)) mkdirSync2(dataDir2, { recursive: true });
  if (!existsSync2(storePath2)) writeFileSync2(storePath2, "[]", "utf8");
}
function readAll2() {
  ensureStore2();
  try {
    return JSON.parse(readFileSync2(storePath2, "utf8")).map(normaliseOrder);
  } catch {
    return [];
  }
}
function normaliseOrder(order) {
  return {
    ...order,
    contact: order.contact ?? null,
    cartFingerprint: order.cartFingerprint ?? "",
    amountPaise: order.amountPaise ?? Math.round((order.total || 0) * 100),
    razorpayOrderId: order.razorpayOrderId ?? null,
    razorpayPaymentId: order.razorpayPaymentId ?? null,
    paymentError: order.paymentError ?? null,
    paymentMethod: order.paymentMethod ?? null
  };
}
function nextTrackingNumber(order) {
  if (order.trackingNumber) return order.trackingNumber;
  const digits = order.number.replace(/\D/g, "") || "000000";
  return `CKTRK${digits}${order.id.slice(-4).toUpperCase()}`;
}
function cartFingerprint(items, coupon, addressKey) {
  const lines = items.map((item) => `${item.productId}:${item.quantity}:${item.finish || ""}`).sort().join("|");
  return `${lines}::${(coupon || "").trim().toUpperCase()}::${addressKey}`;
}
function writeAll2(orders) {
  ensureStore2();
  writeFileSync2(storePath2, JSON.stringify(orders, null, 2), "utf8");
}
function listOrdersForCustomer(customerId) {
  return readAll2().filter((order) => order.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
function getOrderForCustomer(customerId, orderId) {
  return listOrdersForCustomer(customerId).find((order) => order.id === orderId) ?? null;
}
function getOrderByNumberForCustomer(customerId, number) {
  const normalised = number.trim().toUpperCase();
  return listOrdersForCustomer(customerId).find((order) => order.number === normalised) ?? null;
}
function createOrderFromCart(customerId, input) {
  const items = [];
  for (const line of input.items) {
    const product = products.find((entry) => entry.id === line.productId);
    if (!product || line.quantity < 1) continue;
    items.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      finish: line.finish || product.finishes[0] || "Standard",
      quantity: Math.min(12, Math.round(line.quantity)),
      unitPrice: product.price
    });
  }
  if (!items.length) return { error: "empty" };
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const coupon = input.coupon?.trim().toUpperCase() === DEMO_COUPON.code ? DEMO_COUPON.code : null;
  const discount = coupon ? Math.round(subtotal * (DEMO_COUPON.percent / 100)) : 0;
  const total = Math.max(0, subtotal - discount);
  const orders = readAll2();
  const order = {
    id: randomBytes2(10).toString("hex"),
    number: `CK${String(orders.length + 10841).padStart(6, "0")}`,
    customerId,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    items,
    subtotal,
    discount,
    total,
    coupon,
    paymentStatus: input.paymentStatus || "unpaid",
    fulfilmentStatus: "placed",
    shippingAddress: input.address,
    deliveryMethod: null,
    trackingNumber: null,
    estimatedDelivery: null,
    contact: input.contact ?? null,
    cartFingerprint: input.cartFingerprint || "",
    amountPaise: Math.round(total * 100),
    razorpayOrderId: null,
    razorpayPaymentId: null,
    paymentError: null,
    paymentMethod: null
  };
  orders.push(order);
  writeAll2(orders);
  return { order };
}
function findReusableCheckoutOrder(customerId, fingerprint) {
  return listOrdersForCustomer(customerId).find(
    (order) => order.cartFingerprint === fingerprint && order.paymentStatus !== "paid" && order.paymentStatus !== "refunded"
  ) ?? null;
}
function saveOrder(next) {
  const orders = readAll2();
  const index = orders.findIndex((order) => order.id === next.id);
  if (index === -1) return null;
  orders[index] = next;
  writeAll2(orders);
  return next;
}
function attachRazorpayOrder(orderId, customerId, razorpayOrderId) {
  const order = getOrderForCustomer(customerId, orderId);
  if (!order) return null;
  return saveOrder({
    ...order,
    paymentStatus: order.paymentStatus === "paid" ? "paid" : "pending",
    razorpayOrderId,
    paymentError: null
  });
}
function markOrderPaymentFailed(orderId, customerId, message) {
  const order = getOrderForCustomer(customerId, orderId);
  if (!order || order.paymentStatus === "paid") return order;
  return saveOrder({
    ...order,
    paymentStatus: "failed",
    paymentError: message
  });
}
function markOrderPaid(customerId, input) {
  const order = getOrderForCustomer(customerId, input.orderId);
  if (!order) return { error: "missing" };
  if (order.razorpayOrderId !== input.razorpayOrderId) return { error: "mismatch" };
  if (order.paymentStatus === "paid") return { order };
  const paid = saveOrder({
    ...order,
    paymentStatus: "paid",
    fulfilmentStatus: order.fulfilmentStatus === "placed" ? "confirmed" : order.fulfilmentStatus,
    razorpayPaymentId: input.razorpayPaymentId,
    paymentMethod: input.paymentMethod ?? order.paymentMethod,
    deliveryMethod: input.deliveryMethod ?? order.deliveryMethod,
    trackingNumber: nextTrackingNumber(order),
    paymentError: null
  });
  if (!paid) return { error: "missing" };
  return { order: paid };
}
function markCashOnDelivery(customerId, input) {
  const order = getOrderForCustomer(customerId, input.orderId);
  if (!order) return { error: "missing" };
  if (order.razorpayOrderId !== input.razorpayOrderId) return { error: "mismatch" };
  if (order.paymentStatus === "paid") return { order };
  const next = saveOrder({
    ...order,
    paymentStatus: "pending",
    fulfilmentStatus: order.fulfilmentStatus === "placed" ? "confirmed" : order.fulfilmentStatus,
    paymentMethod: "cash",
    deliveryMethod: "Cash on delivery",
    trackingNumber: nextTrackingNumber(order),
    paymentError: null
  });
  if (!next) return { error: "missing" };
  return { order: next };
}

// server/razorpay.ts
import { createHmac, timingSafeEqual as timingSafeEqual2 } from "node:crypto";
function razorpayConfigFrom(env) {
  const keyId = (env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (env.RAZORPAY_KEY_SECRET || "").trim();
  if (!keyId || !keySecret || keyId.includes("yourKeyId") || keySecret.includes("yourKeySecret")) {
    return {
      ok: false,
      error: "Razorpay test keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from the Razorpay Dashboard (Test Mode) to a local .env file."
    };
  }
  if (keyId.startsWith("rzp_live_")) {
    return {
      ok: false,
      error: "Live Razorpay keys are blocked. This project only accepts rzp_test_ keys until live payments are approved."
    };
  }
  if (!keyId.startsWith("rzp_test_")) {
    return {
      ok: false,
      error: "Only Razorpay Test Mode key IDs (rzp_test_\u2026) are allowed."
    };
  }
  return { ok: true, config: { keyId, keySecret } };
}
function verifyRazorpaySignature(secret, payload) {
  const expected = createHmac("sha256", secret).update(`${payload.orderId}|${payload.paymentId}`).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(payload.signature);
  return left.length === right.length && timingSafeEqual2(left, right);
}
async function createRazorpayOrder(config, input) {
  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt.slice(0, 40),
      notes: input.notes || {}
    })
  });
  const data = await response.json();
  if (!response.ok || !data.id) {
    throw new Error(data.error?.description || "Razorpay could not create a test order.");
  }
  return data;
}

// server/auth-middleware.ts
var COOKIE = "ck_session";
var SECRET = process.env.COUCHKRAFT_AUTH_SECRET || createHmac2("sha256", "couchkraft-local").update("dev").digest("hex");
async function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}
function text(body, key) {
  return typeof body[key] === "string" ? body[key] : "";
}
function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
  return true;
}
function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key) out[key] = decodeURIComponent(rest.join("="));
  }
  return out;
}
function cookieFlags() {
  return process.env.VERCEL ? "HttpOnly; Path=/; SameSite=Lax; Secure" : "HttpOnly; Path=/; SameSite=Lax";
}
function setSession(res, customerId) {
  const token = jwt.sign({ sub: customerId }, SECRET, { expiresIn: "7d" });
  res.setHeader(
    "Set-Cookie",
    `${COOKIE}=${token}; ${cookieFlags()}; Max-Age=${60 * 60 * 24 * 7}`
  );
}
function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; ${cookieFlags()}; Max-Age=0`);
}
function currentUser(req) {
  const token = parseCookies(req.headers.cookie)[COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET);
    return findById(payload.sub);
  } catch {
    return null;
  }
}
function emailOk(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function passwordOk(value) {
  return value.length >= 8;
}
function phoneOk(value) {
  if (!value) return true;
  return /^[0-9+\-\s]{8,16}$/.test(value);
}
function parseAddress(body) {
  const label = text(body, "label").trim() || "Home";
  const line1 = text(body, "line1").trim();
  const city = text(body, "city").trim();
  const region = text(body, "region").trim();
  const postalCode = text(body, "postalCode").trim();
  const country = text(body, "country").trim() || "India";
  if (!line1 || !city || !region || !postalCode) {
    return { error: "Address, city, region and postal code are required." };
  }
  return { label, line1, line2: text(body, "line2").trim(), city, region, postalCode, country };
}
function originFrom(req) {
  const forwarded = req.headers["x-forwarded-proto"];
  const proto = (typeof forwarded === "string" ? forwarded.split(",")[0] : "http").trim() || "http";
  const host = req.headers.host || "localhost:5173";
  return `${proto}://${host}`;
}
var checkoutLocks = /* @__PURE__ */ new Set();
function parseCartItems(body) {
  const rawItems = Array.isArray(body.items) ? body.items : [];
  return rawItems.flatMap((line) => {
    if (!line || typeof line !== "object") return [];
    const row = line;
    if (!row.productId) return [];
    return [{ productId: row.productId, quantity: Number(row.quantity) || 0, finish: row.finish }];
  });
}
function requestApiPath(req) {
  const forwarded = req.headers["x-forwarded-uri"];
  if (typeof forwarded === "string" && forwarded.includes("/api/")) {
    return forwarded.split("?")[0];
  }
  const fromQuery = req.query?.__ck;
  if (typeof fromQuery === "string" && fromQuery.startsWith("/api")) return fromQuery.split("?")[0];
  const search = req.url?.includes("?") ? new URL(req.url, "http://localhost").searchParams.get("__ck") : null;
  if (search?.startsWith("/api")) return search.split("?")[0];
  return req.url?.split("?")[0] ?? "";
}
async function handleCouchkraftApi(req, res, runtimeEnv = process.env) {
  const raw = requestApiPath(req);
  const url = raw.startsWith("/api/") || raw === "/api" ? raw : `/api${raw.startsWith("/") ? raw : `/${raw}`}`;
  if (!url.startsWith("/api/auth") && !url.startsWith("/api/orders") && !url.startsWith("/api/addresses") && !url.startsWith("/api/checkout")) {
    return false;
  }
  try {
    if (req.method === "GET" && url === "/api/auth/me") {
      const user = currentUser(req);
      return send(res, 200, { user: user ? publicCustomer(user) : null });
    }
    if (req.method === "PUT" && url === "/api/auth/profile") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      const body = await readBody(req);
      const name = text(body, "name").trim();
      const email = text(body, "email").trim();
      const phone = text(body, "phone").trim();
      if (name.length < 2) return send(res, 400, { error: "Please enter your full name." });
      if (!emailOk(email)) return send(res, 400, { error: "Enter a valid email address." });
      if (!phoneOk(phone)) return send(res, 400, { error: "Enter a valid phone number, or leave it blank." });
      const updated = updateProfile(user, { name, email, phone });
      if ("error" in updated) return send(res, 409, { error: "An account with this email already exists." });
      return send(res, 200, { user: publicCustomer(updated.customer) });
    }
    if (req.method === "POST" && url === "/api/auth/register") {
      const body = await readBody(req);
      const name = text(body, "name").trim();
      const email = text(body, "email").trim();
      const phone = text(body, "phone").trim();
      const password = text(body, "password");
      const confirm = text(body, "confirmPassword");
      if (name.length < 2) return send(res, 400, { error: "Please enter your full name." });
      if (!emailOk(email)) return send(res, 400, { error: "Enter a valid email address." });
      if (!phoneOk(phone)) return send(res, 400, { error: "Enter a valid phone number, or leave it blank." });
      if (!passwordOk(password)) return send(res, 400, { error: "Password must be at least 8 characters." });
      if (password !== confirm) return send(res, 400, { error: "Passwords do not match." });
      const created = await createCustomer({ name, email, phone, password });
      if ("error" in created) return send(res, 409, { error: "An account with this email already exists." });
      return send(res, 201, {
        message: "Account created. Please verify your email before signing in.",
        devActionUrl: `${originFrom(req)}/account/verify?token=${created.verifyToken}`
      });
    }
    if (req.method === "POST" && url === "/api/auth/login") {
      const body = await readBody(req);
      const email = text(body, "email").trim();
      const password = text(body, "password");
      if (!emailOk(email) || !password) return send(res, 400, { error: "Enter your email and password." });
      const customer = findByEmail(email);
      const hash = customer?.passwordHash || "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
      const ok = await bcrypt2.compare(password, hash);
      if (!customer || !ok) return send(res, 401, { error: "Email or password is incorrect." });
      if (!customer.emailVerified) {
        return send(res, 403, {
          error: "Please verify your email before signing in.",
          needsVerification: true
        });
      }
      setSession(res, customer.id);
      return send(res, 200, { user: publicCustomer(customer) });
    }
    if (req.method === "POST" && url === "/api/auth/logout") {
      clearSession(res);
      return send(res, 200, { ok: true });
    }
    if (req.method === "POST" && url === "/api/auth/forgot") {
      const body = await readBody(req);
      const email = text(body, "email").trim();
      if (!emailOk(email)) return send(res, 400, { error: "Enter a valid email address." });
      const customer = findByEmail(email);
      const payload = {
        message: "If an account exists for this email, reset instructions have been sent."
      };
      if (customer && customer.emailVerified) {
        payload.devActionUrl = `${originFrom(req)}/account/reset?token=${issueResetToken(customer)}`;
      }
      return send(res, 200, payload);
    }
    if (req.method === "POST" && url === "/api/auth/resend-verification") {
      const body = await readBody(req);
      const email = text(body, "email").trim();
      if (!emailOk(email)) return send(res, 400, { error: "Enter a valid email address." });
      const customer = findByEmail(email);
      const payload = {
        message: "If this email needs verification, a new link has been issued."
      };
      if (customer && !customer.emailVerified) {
        payload.devActionUrl = `${originFrom(req)}/account/verify?token=${issueVerifyToken(customer)}`;
      }
      return send(res, 200, payload);
    }
    if (req.method === "POST" && url === "/api/auth/verify") {
      const body = await readBody(req);
      const token = text(body, "token");
      const customer = findByVerifyToken(token);
      if (!customer || !customer.verifyExpires || customer.verifyExpires < Date.now()) {
        return send(res, 400, { error: "This verification link is invalid or has expired." });
      }
      saveCustomer({
        ...customer,
        emailVerified: true,
        verifyTokenHash: null,
        verifyExpires: null
      });
      return send(res, 200, { message: "Email verified. You can sign in now." });
    }
    if (req.method === "GET" && url === "/api/addresses") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      return send(res, 200, { addresses: user.addresses });
    }
    if (req.method === "POST" && url === "/api/addresses") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      const parsed = parseAddress(await readBody(req));
      if ("error" in parsed) return send(res, 400, { error: parsed.error });
      return send(res, 201, { address: addAddress(user, parsed) });
    }
    const addressMatch = url.match(/^\/api\/addresses\/([^/]+)$/);
    if (addressMatch && req.method === "PUT") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      const parsed = parseAddress(await readBody(req));
      if ("error" in parsed) return send(res, 400, { error: parsed.error });
      const address = updateAddress(user, addressMatch[1], parsed);
      if (!address) return send(res, 404, { error: "Address not found." });
      return send(res, 200, { address });
    }
    if (addressMatch && req.method === "DELETE") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      if (!removeAddress(user, addressMatch[1])) return send(res, 404, { error: "Address not found." });
      return send(res, 200, { ok: true });
    }
    if (req.method === "GET" && url === "/api/orders") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      return send(res, 200, { orders: listOrdersForCustomer(user.id) });
    }
    if (req.method === "GET" && url === "/api/checkout/config") {
      const keys = razorpayConfigFrom(runtimeEnv);
      return send(res, 200, {
        configured: true,
        gateway: keys.ok ? "razorpay" : "demo",
        mode: keys.ok ? "test" : "demo",
        keyId: keys.ok ? keys.config.keyId : null,
        error: null
      });
    }
    if (req.method === "POST" && url === "/api/checkout/session") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in to continue to payment." });
      const keys = razorpayConfigFrom(runtimeEnv);
      if (checkoutLocks.has(user.id)) {
        return send(res, 409, { error: "A payment attempt is already in progress. Please wait a moment." });
      }
      checkoutLocks.add(user.id);
      try {
        const body = await readBody(req);
        const addressId = text(body, "addressId");
        const ownedAddress = addressId ? user.addresses.find((entry) => entry.id === addressId) ?? null : null;
        if (addressId && !ownedAddress) return send(res, 400, { error: "Choose a saved address that belongs to you." });
        let address = ownedAddress;
        if (!address) {
          const parsedAddress = parseAddress(body);
          if ("error" in parsedAddress) return send(res, 400, { error: parsedAddress.error });
          address = { ...parsedAddress, id: "checkout" };
        }
        const items = parseCartItems(body);
        const coupon = text(body, "coupon") || null;
        const phone = text(body, "phone").trim() || user.phone;
        if (!phoneOk(phone) || !phone) return send(res, 400, { error: "Enter a valid phone number for this order." });
        const contact = {
          name: text(body, "name").trim() || user.name,
          email: user.email,
          phone
        };
        const fingerprint = cartFingerprint(items, coupon, `${address.line1}|${address.city}|${address.postalCode}`);
        let order = findReusableCheckoutOrder(user.id, fingerprint);
        if (!order) {
          const created = createOrderFromCart(user.id, {
            items,
            address,
            coupon,
            contact,
            paymentStatus: "pending",
            cartFingerprint: fingerprint
          });
          if ("error" in created) return send(res, 400, { error: "Your bag has no valid pieces to order." });
          order = created.order;
        }
        if (order.paymentStatus === "paid") {
          return send(res, 200, { order, alreadyPaid: true, gateway: keys.ok ? "razorpay" : "demo" });
        }
        if (!order.razorpayOrderId) {
          if (keys.ok) {
            const razorpayOrder = await createRazorpayOrder(keys.config, {
              amountPaise: order.amountPaise,
              receipt: order.number,
              notes: { couchkraftOrderId: order.id, customerId: user.id }
            });
            order = attachRazorpayOrder(order.id, user.id, razorpayOrder.id) || order;
          } else {
            order = attachRazorpayOrder(order.id, user.id, `order_demo_${order.id}`) || order;
          }
        }
        return send(res, 200, {
          gateway: keys.ok ? "razorpay" : "demo",
          keyId: keys.ok ? keys.config.keyId : null,
          razorpayOrderId: order.razorpayOrderId,
          amount: order.amountPaise,
          currency: "INR",
          order
        });
      } catch (error) {
        return send(res, 502, {
          error: error instanceof Error ? error.message : "Payment could not be started. Please retry."
        });
      } finally {
        checkoutLocks.delete(user.id);
      }
    }
    if (req.method === "POST" && url === "/api/checkout/demo") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      if (razorpayConfigFrom(runtimeEnv).ok) {
        return send(res, 400, { error: "Demo gateway is disabled while Razorpay test keys are configured." });
      }
      const body = await readBody(req);
      const orderId = text(body, "orderId");
      const method = text(body, "method");
      const action = text(body, "action") || "success";
      const methods = ["card", "cash", "upi", "netbanking"];
      if (!methods.includes(method)) {
        return send(res, 400, { error: "Choose card, cash, UPI or net banking." });
      }
      const existing = getOrderForCustomer(user.id, orderId);
      if (!existing) return send(res, 404, { error: "Order not found." });
      if (!existing.razorpayOrderId?.startsWith("order_demo_")) {
        return send(res, 400, { error: "This order is not using the demo gateway." });
      }
      if (action === "fail") {
        const order = markOrderPaymentFailed(orderId, user.id, "Demo payment failed.");
        return send(res, 200, { order, failed: true });
      }
      const labels = {
        card: "Card",
        upi: "UPI",
        netbanking: "Net banking",
        cash: "Cash on delivery"
      };
      if (method === "cash") {
        const result2 = markCashOnDelivery(user.id, {
          orderId,
          razorpayOrderId: existing.razorpayOrderId
        });
        if ("error" in result2) return send(res, 400, { error: "This payment does not match the order on your account." });
        return send(res, 200, { order: result2.order });
      }
      const result = markOrderPaid(user.id, {
        orderId,
        razorpayOrderId: existing.razorpayOrderId,
        razorpayPaymentId: `pay_demo_${existing.id}`,
        paymentMethod: method,
        deliveryMethod: labels[method]
      });
      if ("error" in result) return send(res, 400, { error: "This payment does not match the order on your account." });
      return send(res, 200, { order: result.order });
    }
    if (req.method === "POST" && url === "/api/checkout/verify") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      const keys = razorpayConfigFrom(runtimeEnv);
      if (!keys.ok) return send(res, 400, { error: "Use the demo gateway until Razorpay test keys are added." });
      const body = await readBody(req);
      const orderId = text(body, "orderId");
      const razorpayOrderId = text(body, "razorpay_order_id");
      const razorpayPaymentId = text(body, "razorpay_payment_id");
      const signature = text(body, "razorpay_signature");
      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !signature) {
        return send(res, 400, { error: "Payment details are incomplete." });
      }
      const valid = verifyRazorpaySignature(keys.config.keySecret, {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature
      });
      if (!valid) {
        markOrderPaymentFailed(orderId, user.id, "Payment signature could not be verified.");
        return send(res, 400, { error: "Payment could not be verified. This order has not been marked as paid." });
      }
      const result = markOrderPaid(user.id, { orderId, razorpayOrderId, razorpayPaymentId });
      if ("error" in result) {
        return send(res, result.error === "missing" ? 404 : 400, {
          error: result.error === "missing" ? "Order not found." : "This payment does not match the order on your account."
        });
      }
      return send(res, 200, { order: result.order });
    }
    if (req.method === "POST" && url === "/api/checkout/fail") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      const body = await readBody(req);
      const order = markOrderPaymentFailed(
        text(body, "orderId"),
        user.id,
        text(body, "reason") || "Payment failed or was cancelled."
      );
      if (!order) return send(res, 404, { error: "Order not found." });
      return send(res, 200, { order });
    }
    if (req.method === "POST" && url === "/api/orders") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      const body = await readBody(req);
      const addressId = text(body, "addressId");
      const address = addressId ? user.addresses.find((entry) => entry.id === addressId) ?? null : null;
      if (addressId && !address) return send(res, 400, { error: "Choose a saved address that belongs to you." });
      const items = parseCartItems(body);
      const created = createOrderFromCart(user.id, {
        items,
        address,
        coupon: text(body, "coupon") || null
      });
      if ("error" in created) return send(res, 400, { error: "Your bag has no valid pieces to order." });
      return send(res, 201, { order: created.order });
    }
    if (req.method === "GET" && url === "/api/orders/lookup") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      const number = new URL(req.url || "", "http://localhost").searchParams.get("number") || "";
      const order = getOrderByNumberForCustomer(user.id, number);
      if (!order) return send(res, 404, { error: "No matching order was found on this account." });
      return send(res, 200, { order });
    }
    const orderMatch = url.match(/^\/api\/orders\/([^/]+)$/);
    if (orderMatch && req.method === "GET") {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: "Please sign in." });
      const order = getOrderForCustomer(user.id, orderMatch[1]);
      if (!order) return send(res, 404, { error: "Order not found." });
      return send(res, 200, { order });
    }
    if (req.method === "POST" && url === "/api/auth/reset") {
      const body = await readBody(req);
      const token = text(body, "token");
      const password = text(body, "password");
      const confirm = text(body, "confirmPassword");
      if (!passwordOk(password)) return send(res, 400, { error: "Password must be at least 8 characters." });
      if (password !== confirm) return send(res, 400, { error: "Passwords do not match." });
      const customer = findByResetToken(token);
      if (!customer || !customer.resetExpires || customer.resetExpires < Date.now()) {
        return send(res, 400, { error: "This reset link is invalid or has expired." });
      }
      await setPassword(customer, password);
      return send(res, 200, { message: "Password updated. You can sign in now." });
    }
    return send(res, 404, { error: "Not found." });
  } catch {
    return send(res, 500, { error: "Something went wrong. Please try again." });
  }
}

// server/vercel-handler.ts
async function handler(req, res) {
  try {
    const handled = await handleCouchkraftApi(req, res);
    if (!handled) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Not found." }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "Server error." }));
  }
}
export {
  handler as default
};
