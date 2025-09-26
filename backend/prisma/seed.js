// backend/src/seed.js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Chance from "chance";
import { generateSequentialId } from "../src/utils/idGenerator.js";

const prisma = new PrismaClient();
const chance = new Chance();

async function main() {
  console.log("🟢 Seeding started...");

  // --- 1. Location ---
  const location = await prisma.location.create({
    data: { name: "Main Branch", address: "Downtown" },
  });

  // --- 2. Users ---
  const hashedPasswords = {
    ADMIN: await bcrypt.hash("adminpassword", 10),
    MANAGER: await bcrypt.hash("managerpassword", 10),
    STAFF: await bcrypt.hash("staffpassword", 10),
  };

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPasswords.ADMIN,
      name: "System Admin",
      role: "ADMIN",
      locationId: location.id,
    },
  });

  const managers = [];
  for (let i = 0; i < 2; i++) {
    managers.push(
      await prisma.user.create({
        data: {
          email: `manager${i + 1}@example.com`,
          password: hashedPasswords.MANAGER,
          name: `Manager ${i + 1}`,
          role: "MANAGER",
          locationId: location.id,
        },
      })
    );
  }

  const staffUsers = [];
  for (let i = 0; i < 3; i++) {
    staffUsers.push(
      await prisma.user.create({
        data: {
          email: `staff${i + 1}@example.com`,
          password: hashedPasswords.STAFF,
          name: `Staff ${i + 1}`,
          role: "STAFF",
          locationId: location.id,
        },
      })
    );
  }

  const allUsers = [admin, ...managers, ...staffUsers];
  console.log("✅ Users seeded");

  // --- 3. Categories ---
  const categories = [];
  for (let i = 0; i < 10; i++) {
    categories.push(
      await prisma.category.create({ data: { name: `Category ${i + 1}` } })
    );
  }
  console.log("✅ Categories seeded");

  // --- 4. Products ---
  const products = [];
  for (let i = 0; i < 100; i++) {
    const category = chance.pickone(categories);
    products.push(
      await prisma.product.create({
        data: {
          name: `Product ${i + 1}`,
          sku: `SKU-${String(i + 1).padStart(3, "0")}`,
          price: chance.floating({ min: 10, max: 1000, fixed: 2 }),
          locationId: location.id,
          categoryId: category.id,
        },
      })
    );
  }
  console.log("✅ Products seeded");

  // --- 5. Vendors ---
  const vendors = [];
  for (let i = 0; i < 5; i++) {
    vendors.push(
      await prisma.vendor.create({
        data: {
          name: `Vendor ${i + 1}`,
          email: `vendor${i + 1}@example.com`,
          phone: chance.string({ length: 10, pool: "0123456789" }),
        },
      })
    );
  }
  console.log("✅ Vendors seeded");

  // --- 6. ProductVendor relations ---
  for (const product of products) {
    const vendorCount = chance.integer({ min: 1, max: 3 });
    const selectedVendors = chance.pickset(vendors, vendorCount);

    for (const vendor of selectedVendors) {
      await prisma.productVendor.create({
        data: {
          productId: product.id,
          vendorId: vendor.id,
          vendorPrice:
            product.price * chance.floating({ min: 0.9, max: 1.1, fixed: 2 }),
          leadTimeDays: chance.integer({ min: 2, max: 14 }),
        },
      });
    }
  }
  console.log("✅ Product-Vendor relations seeded");

  // --- 7. Customers ---
  const customers = [];
  for (let i = 0; i < 15; i++) {
    customers.push(
      await prisma.customer.create({
        data: {
          name: chance.name(),
          email: chance.email(),
          phone: chance.string({ length: 10, pool: "0123456789" }),
          credit_limit: 5000,
        },
      })
    );
  }
  console.log("✅ Customers seeded");

  // --- 8. Purchases + Ledger + IssuedPayments ---
  for (let i = 0; i < 50; i++) {
    const vendor = vendors[i % vendors.length];
    const supplied = await prisma.productVendor.findMany({
      where: { vendorId: vendor.id },
      select: { productId: true, vendorPrice: true },
    });
    if (!supplied.length) continue;

    const { productId, vendorPrice } = chance.pickone(supplied);
    const product = products.find((p) => p.id === productId);
    if (!product) continue;

    const qty = chance.integer({ min: 1, max: 20 });
    const received = chance.bool();
    const receivedByUser = received ? chance.pickone(allUsers) : null;
    const priceToUse = vendorPrice ?? product.price;
    const purchaseUuid = await generateSequentialId("Purchase");

    const purchase = await prisma.purchase.create({
      data: {
        purchaseUuid,
        vendorId: vendor.id,
        locationId: location.id,
        total: qty * priceToUse,
        received,
        receivedBy: receivedByUser?.id,
        items: { create: [{ productId, qty, price: priceToUse }] },
      },
    });

    if (received) {
      await prisma.stockLevel.upsert({
        where: { productId_locationId: { productId, locationId: location.id } },
        update: { quantity: { increment: qty } },
        create: { productId, locationId: location.id, quantity: qty },
      });
    }

    await prisma.ledgerEntry.create({
      data: {
        purchaseId: purchase.id,
        vendorId: vendor.id,
        type: "PURCHASE",
        amount: purchase.total,
        description: `Purchase from ${vendor.name}`,
      },
    });

    if (chance.bool()) {
      const amountPaid = parseFloat(
        (
          purchase.total * chance.floating({ min: 0.3, max: 1, fixed: 2 })
        ).toFixed(2)
      );
      const paymentNumber = await generateSequentialId("IssuedPayment");
      const issuedPayment = await prisma.issuedPayment.create({
        data: {
          purchaseId: purchase.id,
          vendorId: vendor.id,
          amount: amountPaid,
          method: chance.pickone(["CASH", "BANK_TRANSFER"]),
          paymentNumber,
        },
      });
      await prisma.ledgerEntry.create({
        data: {
          vendorId: vendor.id,
          purchaseId: purchase.id,
          issuedPaymentId: issuedPayment.id,
          type: "PAYMENT_ISSUED",
          amount: amountPaid,
          method: issuedPayment.method,
          description: `Payment ${paymentNumber} for ${purchase.purchaseUuid}`,
        },
      });
    }
  }
  console.log("✅ Purchases seeded");

  // --- 9. Sales + Ledger + ReceivedPayments ---
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
    const saleUuid = await generateSequentialId("Sale");

    const sale = await prisma.sale.create({
      data: {
        saleUuid,
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

    await prisma.ledgerEntry.create({
      data: {
        saleId: sale.id,
        customerId: customer.id,
        type: "SALE",
        amount: total,
        description: `Sale ${saleUuid} to ${customer.name}`,
      },
    });

    if (chance.bool()) {
      const amountPaid = parseFloat(
        (total * chance.floating({ min: 0.3, max: 1, fixed: 2 })).toFixed(2)
      );
      const paymentNumber = await generateSequentialId("ReceivedPayment");
      const receivedPayment = await prisma.receivedPayment.create({
        data: {
          saleId: sale.id,
          customerId: customer.id,
          amount: amountPaid,
          method: chance.pickone(["CASH", "CREDIT_CARD", "BANK_TRANSFER"]),
          paymentNumber,
        },
      });
      await prisma.ledgerEntry.create({
        data: {
          customerId: customer.id,
          saleId: sale.id,
          receivedPaymentId: receivedPayment.id,
          type: "PAYMENT_RECEIVED",
          amount: amountPaid,
          method: receivedPayment.method,
          description: `Payment ${paymentNumber} for ${saleUuid}`,
        },
      });
    }
  }
  console.log("✅ Sales seeded");

  // --- 10. Returns + Ledger ---
  console.log("🟢 Seeding Returns and Ledger adjustments...");

  // Fetch last Return number from DB
  let lastReturnRecord = await prisma.return.findFirst({
    orderBy: { createdAt: "desc" },
    select: { returnUuid: true },
  });

  let lastReturnNumber = 0;
  if (lastReturnRecord?.returnUuid) {
    const match = lastReturnRecord.returnUuid.match(/\d+$/);
    if (match) lastReturnNumber = parseInt(match[0], 10);
  }

  // Returns
  for (let i = 0; i < 20; i++) {
    const customer = chance.pickone(customers);

    const sale = await prisma.sale.findFirst({
      where: { customerId: customer.id },
      include: { items: true },
    });
    if (!sale || !sale.items.length) continue;

    const saleItem = chance.pickone(sale.items);
    const qtyReturn = Math.min(
      saleItem.qty,
      chance.integer({ min: 1, max: 2 })
    );
    const totalReturn = qtyReturn * saleItem.price;

    // Increment lastReturnNumber instead of looping for uniqueness
    lastReturnNumber++;
    const returnUuid = `RET-${String(lastReturnNumber).padStart(4, "0")}`;

    await prisma.return.create({
      data: {
        returnUuid,
        saleId: sale.id,
        customerId: customer.id,
        totalAmount: totalReturn,
        items: {
          create: [
            {
              productId: saleItem.productId,
              qty: qtyReturn,
              price: saleItem.price,
            },
          ],
        },
      },
    });

    await prisma.stockLevel.upsert({
      where: {
        productId_locationId: {
          productId: saleItem.productId,
          locationId: sale.locationId,
        },
      },
      update: { quantity: { increment: qtyReturn } },
      create: {
        productId: saleItem.productId,
        locationId: sale.locationId,
        quantity: qtyReturn,
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        saleId: sale.id,
        customerId: customer.id,
        type: "RETURN",
        amount: totalReturn,
        description: `Return ${returnUuid} for sale ${sale.saleUuid}`,
      },
    });
  }
  console.log("✅ Returns and Ledger adjustments seeded");

  // --- 11. Ledger Adjustments ---
  for (let i = 0; i < 15; i++) {
    const customer = chance.pickone(customers);
    const adjustmentAmount = chance.floating({ min: -500, max: 500, fixed: 2 });
    const adjustmentNumber = await generateSequentialId("Adjustment");

    await prisma.ledgerEntry.create({
      data: {
        customerId: customer.id,
        type: "ADJUSTMENT",
        amount: adjustmentAmount,
        description: `Adjustment ${adjustmentNumber} for customer ${customer.name}`,
      },
    });
  }

  console.log("✅ Ledger adjustments seeded");

  // --- 11. Ledger Adjustments ---
  for (let i = 0; i < 15; i++) {
    const customer = chance.pickone(customers);
    const adjustmentAmount = chance.floating({ min: -500, max: 500, fixed: 2 });
    const adjustmentNumber = await generateSequentialId("Adjustment");

    await prisma.ledgerEntry.create({
      data: {
        customerId: customer.id,
        type: "ADJUSTMENT",
        amount: adjustmentAmount,
        description: `Adjustment ${adjustmentNumber} for customer ${customer.name}`,
      },
    });
  }
  console.log("✅ Ledger adjustments seeded");

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
