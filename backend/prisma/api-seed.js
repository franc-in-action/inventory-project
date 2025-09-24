import fetch from "node-fetch";

const API_BASE = "http://localhost:3000/api"; // adjust to your backend URL

let adminToken = "";
let managerToken = "";

// Helper to login and get token
async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  return data.token; // assumes your API returns { token: "..." }
}

// Helper to make authenticated requests
async function apiPost(endpoint, body, token) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function main() {
  // 1. Create Location as admin
  adminToken = await login("admin@example.com", "password");

  const location = await apiPost(
    "/locations",
    { name: "Main Branch", address: "Downtown" },
    adminToken
  );

  // 2. Create Admin user (already logged in)
  const adminUser = await apiPost(
    "/users",
    {
      email: "admin@example.com",
      password: "password",
      name: "System Admin",
      role: "ADMIN",
      locationId: location.id,
    },
    adminToken
  );

  // 3. Create Manager user
  const managerUser = await apiPost(
    "/users",
    {
      email: "manager@example.com",
      password: "password",
      name: "Branch Manager",
      role: "MANAGER",
      locationId: location.id,
    },
    adminToken
  );

  // 4. Login as manager to get token
  managerToken = await login("manager@example.com", "password");

  // 5. Create Category as manager
  const category = await apiPost(
    "/categories",
    { name: "Electronics", createdBy: managerUser.id },
    managerToken
  );

  // 6. Create Product as manager
  const product = await apiPost(
    "/products",
    {
      name: "Laptop",
      sku: "SKU-001",
      price: 1000,
      categoryId: category.id,
      locationId: location.id,
      createdBy: managerUser.id,
    },
    managerToken
  );

  // 7. Create Vendor as manager
  const vendor = await apiPost(
    "/vendors",
    {
      name: "Tech Supplier",
      email: "vendor@example.com",
      createdBy: managerUser.id,
    },
    managerToken
  );

  // 8. Create Purchase as manager
  const purchase = await apiPost(
    "/purchases",
    {
      vendorId: vendor.id,
      locationId: location.id,
      items: [{ productId: product.id, qty: 10, price: 900 }],
      createdBy: managerUser.id,
    },
    managerToken
  );

  // 9. Receive Purchase as manager
  await apiPost(
    `/purchases/${purchase.id}/receive`,
    { receivedBy: managerUser.id },
    managerToken
  );

  // 10. Create Customer as manager
  const customer = await apiPost(
    "/customers",
    {
      name: "John Doe",
      email: "customer@example.com",
      createdBy: managerUser.id,
    },
    managerToken
  );

  // 11. Create Sale as manager
  const sale = await apiPost(
    "/sales",
    {
      customerId: customer.id,
      locationId: location.id,
      items: [{ productId: product.id, qty: 2, price: 1000 }],
      createdBy: managerUser.id,
    },
    managerToken
  );

  // 12. Create Payment as manager
  await apiPost(
    "/payments",
    {
      customerId: customer.id,
      saleId: sale.id,
      amount: 2000,
      method: "CASH",
      createdBy: managerUser.id,
    },
    managerToken
  );

  console.log("Seed completed with authenticated API calls!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
