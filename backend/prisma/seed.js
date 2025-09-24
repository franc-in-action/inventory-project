import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Chance from "chance";

const prisma = new PrismaClient();
const chance = new Chance();

async function main() {
  // --- 1. Create Location ---
  const location = await prisma.location.create({
    data: { name: "Main Branch", address: "Downtown" },
  });

  // --- 2. Admin User ---
  const hashedAdminPassword = await bcrypt.hash("adminpassword", 10);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedAdminPassword,
      name: "System Admin",
      role: "ADMIN",
      locationId: location.id,
    },
  });

  // --- 3. 2 Managers ---
  const hashedManagerPassword = await bcrypt.hash("managerpassword", 10);
  const managers = [];
  for (let i = 1; i <= 2; i++) {
    const manager = await prisma.user.create({
      data: {
        email: `manager${i}@example.com`,
        password: hashedManagerPassword,
        name: `Manager ${i}`,
        role: "MANAGER",
        locationId: location.id,
      },
    });
    managers.push(manager);
  }

  // --- 4. 3 Staff ---
  const hashedStaffPassword = await bcrypt.hash("staffpassword", 10);
  const staffUsers = [];
  for (let i = 1; i <= 3; i++) {
    const staff = await prisma.user.create({
      data: {
        email: `staff${i}@example.com`,
        password: hashedStaffPassword,
        name: `Staff ${i}`,
        role: "STAFF",
        locationId: location.id,
      },
    });
    staffUsers.push(staff);
  }

  const allUsers = [...managers, ...staffUsers];

  // --- 5. 10 Categories ---
  const categories = [];
  for (let i = 1; i <= 10; i++) {
    const category = await prisma.category.create({
      data: { name: `Category ${i}` },
    });
    categories.push(category);
  }

  // --- 6. 100 Products ---
  const products = [];
  for (let i = 1; i <= 100; i++) {
    const category = categories[i % categories.length];
    const product = await prisma.product.create({
      data: {
        name: `Product ${i}`,
        sku: `SKU-${i.toString().padStart(3, "0")}`,
        quantity: 0,
        price: chance.floating({ min: 10, max: 1000, fixed: 2 }),
        locationId: location.id,
        categoryId: category.id,
      },
    });
    products.push(product);
  }

  // --- 7. 5 Vendors ---
  const vendors = [];
  for (let i = 1; i <= 5; i++) {
    const vendor = await prisma.vendor.create({
      data: {
        name: `Vendor ${i}`,
        email: `vendor${i}@example.com`,
        phone: chance.string({ length: 10, pool: "0123456789" }),
      },
    });
    vendors.push(vendor);
  }

  // --- 8. 50 Purchases ---
  for (let i = 1; i <= 50; i++) {
    const vendor = vendors[i % vendors.length];
    const product = products[i % products.length];
    const qty = chance.integer({ min: 1, max: 20 });
    const received = chance.bool();

    // If received, pick a random staff or manager as receiver
    const receivedByUser = received
      ? allUsers[chance.integer({ min: 0, max: allUsers.length - 1 })]
      : null;

    const purchase = await prisma.purchase.create({
      data: {
        purchaseUuid: `PUR-${i.toString().padStart(3, "0")}`,
        vendorId: vendor.id,
        locationId: location.id,
        total: qty * product.price,
        received,
        receivedBy: receivedByUser?.id,
        items: {
          create: [{ productId: product.id, qty, price: product.price }],
        },
      },
    });

    if (received) {
      const existingStock = await prisma.stockLevel.findUnique({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id,
          },
        },
      });

      if (existingStock) {
        await prisma.stockLevel.update({
          where: { id: existingStock.id },
          data: { quantity: existingStock.quantity + qty },
        });
      } else {
        await prisma.stockLevel.create({
          data: {
            productId: product.id,
            locationId: location.id,
            quantity: qty,
          },
        });
      }
    }
  }

  // --- 9. 15 Customers ---
  const customers = [];
  for (let i = 1; i <= 15; i++) {
    const customer = await prisma.customer.create({
      data: {
        name: chance.name(),
        email: chance.email(),
        phone: chance.string({ length: 10, pool: "0123456789" }),
        balance: 0,
        credit_limit: 5000,
      },
    });
    customers.push(customer);
  }

  // --- 10. 50 Sales ---
  let saleCounter = 1;
  for (let i = 0; i < 50; i++) {
    const customer = customers[i % customers.length];
    const product = products[i % products.length];

    const stock = await prisma.stockLevel.findUnique({
      where: {
        productId_locationId: {
          productId: product.id,
          locationId: location.id,
        },
      },
    });
    if (!stock || stock.quantity < 1) continue;

    const qtySold = chance.integer({
      min: 1,
      max: Math.min(stock.quantity, 5),
    });
    const total = qtySold * product.price;

    const sale = await prisma.sale.create({
      data: {
        saleUuid: `SALE-${saleCounter.toString().padStart(3, "0")}`,
        locationId: location.id,
        customerId: customer.id,
        total,
        items: {
          create: [
            { productId: product.id, qty: qtySold, price: product.price },
          ],
        },
      },
    });

    await prisma.stockLevel.update({
      where: { id: stock.id },
      data: { quantity: stock.quantity - qtySold },
    });

    const paymentFraction = chance.floating({ min: 0.3, max: 1, fixed: 2 });
    const amountPaid = parseFloat((total * paymentFraction).toFixed(2));

    await prisma.payment.create({
      data: {
        saleId: sale.id,
        customerId: customer.id,
        amount: amountPaid,
        method: chance.pickone(["CASH", "CREDIT_CARD", "BANK_TRANSFER"]),
      },
    });

    const unpaid = total - amountPaid;
    if (unpaid > 0) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { balance: customer.balance + unpaid },
      });
    }

    saleCounter++;
  }

  console.log("Seed data inserted successfully with receivedBy!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
