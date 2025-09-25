import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Chance from "chance";

const prisma = new PrismaClient();
const chance = new Chance();

async function main() {
  // --- 1. Location ---
  const location = await prisma.location.create({
    data: { name: "Main Branch", address: "Downtown" },
  });

  // --- 2. Users ---
  const hashedAdminPassword = await bcrypt.hash("adminpassword", 10);
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedAdminPassword,
      name: "System Admin",
      role: "ADMIN",
      locationId: location.id,
    },
  });

  const hashedManagerPassword = await bcrypt.hash("managerpassword", 10);
  const managers = await Promise.all(
    Array.from({ length: 2 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `manager${i + 1}@example.com`,
          password: hashedManagerPassword,
          name: `Manager ${i + 1}`,
          role: "MANAGER",
          locationId: location.id,
        },
      })
    )
  );

  const hashedStaffPassword = await bcrypt.hash("staffpassword", 10);
  const staffUsers = await Promise.all(
    Array.from({ length: 3 }, (_, i) =>
      prisma.user.create({
        data: {
          email: `staff${i + 1}@example.com`,
          password: hashedStaffPassword,
          name: `Staff ${i + 1}`,
          role: "STAFF",
          locationId: location.id,
        },
      })
    )
  );

  const allUsers = [...managers, ...staffUsers];

  // --- 3. Categories ---
  const categories = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.category.create({ data: { name: `Category ${i + 1}` } })
    )
  );

  // --- 4. Products ---
  const products = await Promise.all(
    Array.from({ length: 100 }, (_, i) =>
      prisma.product.create({
        data: {
          name: `Product ${i + 1}`,
          sku: `SKU-${String(i + 1).padStart(3, "0")}`,
          price: chance.floating({ min: 10, max: 1000, fixed: 2 }),
          locationId: location.id,
          categoryId: categories[i % categories.length].id,
        },
      })
    )
  );

  // --- 5. Vendors ---
  const vendors = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.vendor.create({
        data: {
          name: `Vendor ${i + 1}`,
          email: `vendor${i + 1}@example.com`,
          phone: chance.string({ length: 10, pool: "0123456789" }),
        },
      })
    )
  );

  // --- 6. ProductVendor many-to-many relations ---
  // Each product will be linked to 1–3 random vendors.
  for (const product of products) {
    const vendorCount = chance.integer({ min: 1, max: 3 });
    const selected = chance.pickset(vendors, vendorCount);
    for (const v of selected) {
      await prisma.productVendor.create({
        data: {
          productId: product.id,
          vendorId: v.id,
          vendorPrice:
            product.price * chance.floating({ min: 0.9, max: 1.1, fixed: 2 }),
          leadTimeDays: chance.integer({ min: 2, max: 14 }),
        },
      });
    }
  }

  // --- 7. Purchases ---
  // Pick a vendor, then buy a product that vendor actually supplies.
  for (let i = 1; i <= 50; i++) {
    const vendor = vendors[i % vendors.length];

    // get products for this vendor from join table
    const supplied = await prisma.productVendor.findMany({
      where: { vendorId: vendor.id },
      select: { productId: true, vendorPrice: true },
    });
    if (!supplied.length) continue;

    const { productId, vendorPrice } = chance.pickone(supplied);
    const product = products.find((p) => p.id === productId);

    const qty = chance.integer({ min: 1, max: 20 });
    const received = chance.bool();
    const receivedByUser = received ? chance.pickone(allUsers) : null;

    const priceToUse = vendorPrice ?? product.price;

    await prisma.purchase.create({
      data: {
        purchaseUuid: `PUR-${String(i).padStart(3, "0")}`,
        vendorId: vendor.id,
        locationId: location.id,
        total: qty * priceToUse,
        received,
        receivedBy: receivedByUser?.id,
        items: {
          create: [{ productId, qty, price: priceToUse }],
        },
      },
    });

    if (received) {
      const existingStock = await prisma.stockLevel.findUnique({
        where: {
          productId_locationId: {
            productId,
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
            productId,
            locationId: location.id,
            quantity: qty,
          },
        });
      }
    }
  }

  // --- 8. Customers ---
  const customers = await Promise.all(
    Array.from({ length: 15 }, () =>
      prisma.customer.create({
        data: {
          name: chance.name(),
          email: chance.email(),
          phone: chance.string({ length: 10, pool: "0123456789" }),
          balance: 0,
          credit_limit: 5000,
        },
      })
    )
  );

  // --- 9. Sales ---
  let saleCounter = 1;
  for (let i = 0; i < 50; i++) {
    const customer = customers[i % customers.length];
    const product = chance.pickone(products);

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
        saleUuid: `SALE-${String(saleCounter).padStart(3, "0")}`,
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

  console.log("✅ Seed data with Product–Vendor many-to-many inserted!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
