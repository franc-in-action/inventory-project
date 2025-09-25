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

  // --- 6. ProductVendor relations ---
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
  for (let i = 1; i <= 50; i++) {
    const vendor = vendors[i % vendors.length];
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

    const purchase = await prisma.purchase.create({
      data: {
        purchaseUuid: `PUR-${String(i).padStart(3, "0")}`,
        vendorId: vendor.id,
        locationId: location.id,
        total: qty * priceToUse,
        received,
        receivedBy: receivedByUser?.id,
        items: { create: [{ productId, qty, price: priceToUse }] },
      },
    });

    if (received) {
      const existingStock = await prisma.stockLevel.findUnique({
        where: { productId_locationId: { productId, locationId: location.id } },
      });
      if (existingStock) {
        await prisma.stockLevel.update({
          where: { id: existingStock.id },
          data: { quantity: existingStock.quantity + qty },
        });
      } else {
        await prisma.stockLevel.create({
          data: { productId, locationId: location.id, quantity: qty },
        });
      }
    }

    await prisma.ledgerEntry.create({
      data: {
        purchaseId: purchase.id,
        type: "PURCHASE",
        amount: purchase.total,
        description: `Purchase from ${vendor.name}`,
      },
    });
  }

  // --- 8. Customers ---
  const customers = await Promise.all(
    Array.from({ length: 15 }, () =>
      prisma.customer.create({
        data: {
          name: chance.name(),
          email: chance.email(),
          phone: chance.string({ length: 10, pool: "0123456789" }),
          credit_limit: 5000,
        },
      })
    )
  );

  // --- 9. Sales & Payments ---
  const sales = [];
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

    const payment = await prisma.payment.create({
      data: {
        saleId: sale.id,
        customerId: customer.id,
        amount: amountPaid,
        method: chance.pickone(["CASH", "CREDIT_CARD", "BANK_TRANSFER"]),
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        saleId: sale.id,
        customerId: customer.id,
        type: "SALE",
        amount: total,
        description: `Sale to ${customer.name}`,
      },
    });

    await prisma.ledgerEntry.create({
      data: {
        paymentId: payment.id,
        customerId: customer.id,
        type: "PAYMENT_RECEIVED",
        amount: payment.amount,
        method: payment.method,
        description: `Payment for ${sale.saleUuid}`,
      },
    });

    sales.push(sale);
    saleCounter++;
  }

  // --- 10. Returns (multiple items per sale) ---
  for (let i = 0; i < 10; i++) {
    const sale = chance.pickone(sales);
    const saleItems = await prisma.saleItem.findMany({
      where: { saleId: sale.id },
    });
    if (!saleItems.length) continue;

    // Return 1–all items partially
    const itemsToReturn = chance.pickset(
      saleItems,
      chance.integer({ min: 1, max: saleItems.length })
    );

    for (const item of itemsToReturn) {
      const returnQty = chance.integer({ min: 1, max: item.qty });
      const returnAmount = parseFloat((returnQty * item.price).toFixed(2));

      // Update stock
      const stock = await prisma.stockLevel.findUnique({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: location.id,
          },
        },
      });
      if (stock) {
        await prisma.stockLevel.update({
          where: { id: stock.id },
          data: { quantity: stock.quantity + returnQty },
        });
      } else {
        await prisma.stockLevel.create({
          data: {
            productId: item.productId,
            locationId: location.id,
            quantity: returnQty,
          },
        });
      }

      // Ledger for return
      await prisma.ledgerEntry.create({
        data: {
          saleId: sale.id,
          customerId: sale.customerId,
          type: "RETURN",
          amount: -returnAmount,
          description: `Return of ${returnQty}x ${item.productId} from ${sale.saleUuid}`,
        },
      });

      // Optional refund payment
      if (chance.bool({ likelihood: 70 })) {
        const refundMethod = chance.pickone(["CASH", "BANK_TRANSFER"]);
        const refundPayment = await prisma.payment.create({
          data: {
            customerId: sale.customerId,
            amount: returnAmount,
            method: refundMethod,
          },
        });

        await prisma.ledgerEntry.create({
          data: {
            paymentId: refundPayment.id,
            customerId: sale.customerId,
            type: "PAYMENT_RECEIVED",
            amount: returnAmount,
            method: refundMethod,
            description: `Refund for return of ${sale.saleUuid}`,
          },
        });
      }
    }
  }

  // --- 11. Adjustments ---
  for (let i = 0; i < 15; i++) {
    const customer = chance.pickone(customers);
    const adjAmount = parseFloat(
      chance.floating({ min: -100, max: 100, fixed: 2 }).toFixed(2)
    );

    await prisma.ledgerEntry.create({
      data: {
        customerId: customer.id,
        type: "ADJUSTMENT",
        amount: adjAmount,
        description: `Adjustment for ${customer.name}`,
      },
    });
  }

  console.log(
    "✅ Seed completed: sales, returns, payments, ledger-only balances, adjustments!"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
