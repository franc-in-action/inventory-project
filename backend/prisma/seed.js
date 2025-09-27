import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import Chance from "chance";
import { generateSequentialId } from "../src/utils/idGenerator.js";

const prisma = new PrismaClient();
const chance = new Chance();

// Helper: generate random date between two dates
function randomDate(start, end) {
  if (!(start instanceof Date) || isNaN(start)) {
    throw new Error(`Invalid start date: ${start}`);
  }
  if (!(end instanceof Date) || isNaN(end)) {
    throw new Error(`Invalid end date: ${end}`);
  }

  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, "");
}

// 1. Seed multiple branches
async function seedLocations() {
  const locations = [];
  const branchNames = [
    "New York HQ",
    "London Branch",
    "Tokyo Branch",
    "Berlin Branch",
  ];
  for (const name of branchNames) {
    const location = await prisma.location.create({
      data: { name, address: `${name} Address` },
    });
    locations.push(location);
  }
  console.log("✅ Locations seeded");
  return locations;
}

async function seedUsers(location) {
  const locSlug = slugify(location.name);
  const hashedPasswords = {
    ADMIN: await bcrypt.hash("adminpassword", 10),
    MANAGER: await bcrypt.hash("managerpassword", 10),
    STAFF: await bcrypt.hash("staffpassword", 10),
  };

  const admin = await prisma.user.create({
    data: {
      email: `admin@${locSlug}.example.com`,
      password: hashedPasswords.ADMIN,
      name: `System Admin - ${location.name}`,
      role: "ADMIN",
      locationId: location.id,
    },
  });

  const managers = [];
  for (let i = 0; i < 2; i++) {
    managers.push(
      await prisma.user.create({
        data: {
          email: `manager${i + 1}@${locSlug}.example.com`,
          password: hashedPasswords.MANAGER,
          name: `Manager ${i + 1} - ${location.name}`,
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
          email: `staff${i + 1}@${locSlug}.example.com`,
          password: hashedPasswords.STAFF,
          name: `Staff ${i + 1} - ${location.name}`,
          role: "STAFF",
          locationId: location.id,
        },
      })
    );
  }

  const allUsers = [admin, ...managers, ...staffUsers];
  console.log(`✅ Users seeded for ${location.name}`);
  return { admin, managers, staffUsers, allUsers };
}

// 2. Seed categories
async function seedCategories() {
  const categoryNames = [
    "Smartphones",
    "Tablets",
    "Laptops",
    "Smartwatches",
    "Televisions",
    "Streaming Devices",
    "Headphones & Earbuds",
    "Refrigerators",
    "Washing Machines",
    "Robot Vacuums",
    "Smart Speakers / Voice Assistants",
    "Smart Doorbells",
    "Smart Thermostats",
    "Wi-Fi Routers",
  ];

  const categories = [];

  for (const name of categoryNames) {
    const category = await prisma.category.create({
      data: { name },
    });
    categories.push(category);
  }

  console.log("✅ Categories seeded");
  return categories;
}

// 3. Seed products
async function seedProducts(locations, categories) {
  const productsData = [
    // Smartphones
    { category: "Smartphones", name: "iPhone 15", brand: "Apple" },
    { category: "Smartphones", name: "iPhone 14", brand: "Apple" },
    { category: "Smartphones", name: "Galaxy S24", brand: "Samsung" },
    { category: "Smartphones", name: "Galaxy A54", brand: "Samsung" },
    { category: "Smartphones", name: "Pixel 8", brand: "Google" },
    { category: "Smartphones", name: "Pixel 8 Pro", brand: "Google" },
    { category: "Smartphones", name: "OnePlus 12", brand: "OnePlus" },
    { category: "Smartphones", name: "OnePlus Nord 3", brand: "OnePlus" },
    { category: "Smartphones", name: "Xiaomi 13", brand: "Xiaomi" },
    { category: "Smartphones", name: "Redmi Note 12", brand: "Xiaomi" },

    // Tablets
    { category: "Tablets", name: "iPad Pro (M4)", brand: "Apple" },
    { category: "Tablets", name: "iPad Air (M2)", brand: "Apple" },
    { category: "Tablets", name: "Galaxy Tab S9", brand: "Samsung" },
    { category: "Tablets", name: "Tab A9", brand: "Samsung" },
    { category: "Tablets", name: "Fire HD 10", brand: "Amazon" },
    { category: "Tablets", name: "Fire Max 11", brand: "Amazon" },

    // Laptops
    { category: "Laptops", name: "MacBook Air (M3)", brand: "Apple" },
    { category: "Laptops", name: "MacBook Pro (M3)", brand: "Apple" },
    { category: "Laptops", name: "XPS 13", brand: "Dell" },
    { category: "Laptops", name: "XPS 15", brand: "Dell" },
    { category: "Laptops", name: "Spectre x360", brand: "HP" },
    { category: "Laptops", name: "Envy", brand: "HP" },
    { category: "Laptops", name: "ThinkPad X1 Carbon", brand: "Lenovo" },
    { category: "Laptops", name: "Yoga 9i", brand: "Lenovo" },
    { category: "Laptops", name: "ROG Zephyrus", brand: "ASUS" },
    { category: "Laptops", name: "ZenBook Duo", brand: "ASUS" },

    // Smartwatches
    { category: "Smartwatches", name: "Apple Watch Series 9", brand: "Apple" },
    { category: "Smartwatches", name: "Ultra 2", brand: "Apple" },
    { category: "Smartwatches", name: "Galaxy Watch 6", brand: "Samsung" },
    { category: "Smartwatches", name: "Fenix 7", brand: "Garmin" },
    { category: "Smartwatches", name: "Venu 3", brand: "Garmin" },
    { category: "Smartwatches", name: "Versa 4", brand: "Fitbit" },
    { category: "Smartwatches", name: "Sense 2", brand: "Fitbit" },

    // Televisions
    { category: "Televisions", name: "OLED C4", brand: "LG" },
    { category: "Televisions", name: "G4", brand: "LG" },
    { category: "Televisions", name: "Neo QLED QN90C", brand: "Samsung" },
    { category: "Televisions", name: "The Frame", brand: "Samsung" },
    { category: "Televisions", name: "Bravia XR A95L OLED", brand: "Sony" },
    { category: "Televisions", name: "Q Class Q7", brand: "TCL" },
    { category: "Televisions", name: "6-Series Mini-LED", brand: "TCL" },
    { category: "Televisions", name: "U8K Mini-LED", brand: "Hisense" },
    { category: "Televisions", name: "U6H QLED", brand: "Hisense" },

    // Streaming Devices
    {
      category: "Streaming Devices",
      name: "Roku Streaming Stick 4K",
      brand: "Roku",
    },
    {
      category: "Streaming Devices",
      name: "Fire TV Stick 4K Max",
      brand: "Amazon",
    },
    {
      category: "Streaming Devices",
      name: "Chromecast with Google TV (4K)",
      brand: "Google",
    },
    {
      category: "Streaming Devices",
      name: "Apple TV 4K (3rd Gen)",
      brand: "Apple",
    },

    // Headphones & Earbuds
    {
      category: "Headphones & Earbuds",
      name: "AirPods Pro (2nd Gen)",
      brand: "Apple",
    },
    { category: "Headphones & Earbuds", name: "AirPods Max", brand: "Apple" },
    { category: "Headphones & Earbuds", name: "WH-1000XM5", brand: "Sony" },
    { category: "Headphones & Earbuds", name: "WF-1000XM5", brand: "Sony" },
    {
      category: "Headphones & Earbuds",
      name: "QuietComfort Ultra",
      brand: "Bose",
    },
    { category: "Headphones & Earbuds", name: "QC Earbuds II", brand: "Bose" },
    {
      category: "Headphones & Earbuds",
      name: "Galaxy Buds2 Pro",
      brand: "Samsung",
    },

    // Refrigerators
    {
      category: "Refrigerators",
      name: "Bespoke 4-Door Flex",
      brand: "Samsung",
    },
    {
      category: "Refrigerators",
      name: "InstaView with Craft Ice",
      brand: "LG",
    },
    {
      category: "Refrigerators",
      name: "French Door w/ Smart Features",
      brand: "Whirlpool",
    },

    // Washing Machines
    { category: "Washing Machines", name: "TurboWash3D", brand: "LG" },
    { category: "Washing Machines", name: "AI DD Series", brand: "LG" },
    { category: "Washing Machines", name: "AddWash", brand: "Samsung" },
    {
      category: "Washing Machines",
      name: "Smart Dial Washer",
      brand: "Samsung",
    },
    {
      category: "Washing Machines",
      name: "Load & Go Dispenser Models",
      brand: "Whirlpool",
    },

    // Robot Vacuums
    { category: "Robot Vacuums", name: "Roomba j9+", brand: "iRobot" },
    { category: "Robot Vacuums", name: "Roomba s9+", brand: "iRobot" },
    { category: "Robot Vacuums", name: "S8 Pro Ultra", brand: "Roborock" },
    { category: "Robot Vacuums", name: "Q Revo", brand: "Roborock" },
    { category: "Robot Vacuums", name: "Deebot X2 Omni", brand: "Ecovacs" },

    // Smart Speakers / Voice Assistants
    {
      category: "Smart Speakers / Voice Assistants",
      name: "Echo Dot (5th Gen)",
      brand: "Amazon",
    },
    {
      category: "Smart Speakers / Voice Assistants",
      name: "Echo Show 10",
      brand: "Amazon",
    },
    {
      category: "Smart Speakers / Voice Assistants",
      name: "Nest Mini",
      brand: "Google",
    },
    {
      category: "Smart Speakers / Voice Assistants",
      name: "Nest Hub Max",
      brand: "Google",
    },
    {
      category: "Smart Speakers / Voice Assistants",
      name: "HomePod Mini",
      brand: "Apple",
    },

    // Smart Doorbells
    {
      category: "Smart Doorbells",
      name: "Video Doorbell Pro 2",
      brand: "Ring",
    },
    {
      category: "Smart Doorbells",
      name: "Nest Doorbell (Battery)",
      brand: "Google",
    },
    {
      category: "Smart Doorbells",
      name: "Essential Video Doorbell",
      brand: "Arlo",
    },

    // Smart Thermostats
    {
      category: "Smart Thermostats",
      name: "Nest Learning Thermostat (3rd Gen)",
      brand: "Google",
    },
    {
      category: "Smart Thermostats",
      name: "Smart Thermostat Premium",
      brand: "Ecobee",
    },
    {
      category: "Smart Thermostats",
      name: "T9 Smart Thermostat",
      brand: "Honeywell",
    },

    // Wi-Fi Routers
    { category: "Wi-Fi Routers", name: "Archer AX11000", brand: "TP-Link" },
    { category: "Wi-Fi Routers", name: "Deco X90", brand: "TP-Link" },
    {
      category: "Wi-Fi Routers",
      name: "ROG Rapture GT-AXE16000",
      brand: "ASUS",
    },
    { category: "Wi-Fi Routers", name: "Nighthawk AX12", brand: "Netgear" },
    { category: "Wi-Fi Routers", name: "Orbi Mesh AX6000", brand: "Netgear" },
  ];

  const products = [];

  for (const p of productsData) {
    const category = categories.find((c) => c.name === p.category);
    if (!category) continue;

    const location = chance.pickone(locations);

    const product = await prisma.product.create({
      data: {
        name: p.name,
        sku: `SKU-${chance.string({
          length: 6,
          pool: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        })}`,
        description: `${p.brand} ${
          p.name
        } is a premium ${p.category.toLowerCase()} offering excellent performance and quality.`,
        price: chance.floating({ min: 50, max: 5000, fixed: 2 }),
        categoryId: category.id,
        locationId: location.id,
      },
    });

    products.push(product);
  }

  console.log("✅ Products seeded with locations and descriptions");
  return products;
}

// 4. Seed vendors
async function seedVendors() {
  const electronicsSuffixes = [
    "Electronics",
    "Tech",
    "Systems",
    "Solutions",
    "Devices",
    "Innovations",
  ];
  const vendors = [];

  for (let i = 0; i < 15; i++) {
    const companyName = `${chance.company()} ${chance.pickone(
      electronicsSuffixes
    )}`;
    const email = `${companyName
      .replace(/\s+/g, "")
      .toLowerCase()}@example.com`;
    const phone = chance.string({ length: 10, pool: "0123456789" });

    vendors.push(
      await prisma.vendor.create({
        data: {
          name: companyName,
          email,
          phone,
        },
      })
    );
  }

  console.log("✅ Vendors seeded with realistic electronics company names");
  return vendors;
}

// 5. Seed Product-Vendor relations
async function seedProductVendors(products, vendors) {
  for (const product of products) {
    const vendorCount = chance.integer({ min: 1, max: 3 });
    const selectedVendors = chance.pickset(vendors, vendorCount);
    for (const vendor of selectedVendors) {
      await prisma.productVendor.create({
        data: {
          productId: product.id,
          vendorId: vendor.id,
          vendorPrice:
            product.price * chance.floating({ min: 0.85, max: 1.15, fixed: 2 }),
          leadTimeDays: chance.integer({ min: 2, max: 30 }),
        },
      });
    }
  }
  console.log("✅ Product-Vendor relations seeded");
}

// 6. Seed customers
async function seedCustomers() {
  const customers = [];
  for (let i = 0; i < 200; i++) {
    customers.push(
      await prisma.customer.create({
        data: {
          name: chance.name(),
          email: chance.email(),
          phone: chance.string({ length: 10, pool: "0123456789" }),
          credit_limit: chance.floating({ min: 1000, max: 20000, fixed: 2 }),
        },
      })
    );
  }
  console.log("✅ Customers seeded");
  return customers;
}

// 7. Seed purchases with historical dates
async function seedPurchases(products, vendors, locations, allUsers, admin) {
  const purchases = [];
  for (let i = 0; i < 300; i++) {
    const vendor = chance.pickone(vendors);
    const product = chance.pickone(products);
    const location = chance.pickone(locations);

    // Purchase date: Jan 1, 2020 → Sep 1, 2025
    const purchaseDate = randomDate(
      new Date(2020, 0, 1), // January 1, 2020
      new Date(2025, 8, 1) // September 1, 2025
    );

    const qty = chance.integer({ min: 50, max: 500 });
    const received = chance.bool({ likelihood: 85 });
    const receivedByUser = received ? chance.pickone(allUsers) : null;
    const priceToUse =
      product.price * chance.floating({ min: 0.9, max: 1.1, fixed: 2 });
    const purchaseUuid = await generateSequentialId("Purchase");

    const purchase = await prisma.purchase.create({
      data: {
        purchaseUuid,
        vendorId: vendor.id,
        locationId: location.id,
        total: qty * priceToUse,
        received,
        receivedBy: receivedByUser?.id,
        createdAt: purchaseDate,
        items: { create: [{ productId: product.id, qty, price: priceToUse }] },
      },
    });

    if (received) {
      await prisma.stockLevel.upsert({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id,
          },
        },
        update: { quantity: { increment: qty } },
        create: {
          productId: product.id,
          locationId: location.id,
          quantity: qty,
        },
      });

      await prisma.stockMovement.create({
        data: {
          movementUuid: `STM-${Date.now()}-${i}`,
          productId: product.id,
          locationId: location.id,
          delta: qty,
          reason: "PURCHASE_RECEIVED",
          refId: purchase.id,
          performedBy: receivedByUser?.id || admin.id,
          createdAt: purchaseDate,
        },
      });
    }

    purchases.push({ ...purchase, date: purchaseDate });
  }
  console.log("✅ Purchases seeded across historical dates");
  return purchases;
}

// 8. Seed sales with stock check and historical spread
async function seedSales(products, customers, locations, managers, staffUsers) {
  const sales = [];

  for (let i = 0; i < 1000; i++) {
    const product = chance.pickone(products);
    const location = chance.pickone(locations);
    const customer = chance.pickone(customers);

    // Fetch all stock movements for this product/location, ordered by date
    const movements = await prisma.stockMovement.findMany({
      where: { productId: product.id, locationId: location.id },
      orderBy: { createdAt: "asc" },
    });

    if (!movements.length) continue; // No stock ever, skip

    // Build availability periods
    let stockLevel = 0;
    const availabilityPeriods = [];
    let periodStart = null;

    for (const m of movements) {
      stockLevel += m.delta;

      if (stockLevel > 0 && periodStart === null) {
        // Stock became available
        periodStart = m.createdAt;
      } else if (stockLevel <= 0 && periodStart !== null) {
        // Stock went out
        availabilityPeriods.push({ start: periodStart, end: m.createdAt });
        periodStart = null;
      }
    }

    // If still in stock at the end
    if (periodStart !== null) {
      availabilityPeriods.push({
        start: periodStart,
        end: new Date(2025, 8, 25),
      });
    }

    if (!availabilityPeriods.length) continue; // No available period, skip

    // Pick a random availability period
    const period = chance.pickone(availabilityPeriods);

    // Random sale date within that period
    const saleDate = randomDate(new Date(period.start), new Date(period.end));

    // Determine stock available at that point
    const stockAtDate = movements
      .filter((m) => m.createdAt <= saleDate)
      .reduce((sum, m) => sum + m.delta, 0);

    if (stockAtDate < 1) continue; // No stock available, skip

    // Random quantity to sell (max 5 or current stock)
    const qtySold = chance.integer({ min: 1, max: Math.min(stockAtDate, 5) });
    const total = qtySold * product.price;

    // Random sale status
    const statusRoll = chance.integer({ min: 1, max: 100 });
    const status =
      statusRoll <= 30
        ? "PENDING"
        : statusRoll <= 80
        ? "COMPLETE"
        : "CANCELLED";

    const saleUuid =
      status === "COMPLETE"
        ? await generateSequentialId("Sale")
        : await generateSequentialId("Draft");

    const createdByUser = chance.pickone([...managers, ...staffUsers]);
    const finalizedByUser =
      status === "COMPLETE" || status === "CANCELLED"
        ? chance.pickone([...managers, ...staffUsers])
        : null;

    // Create sale
    const sale = await prisma.sale.create({
      data: {
        saleUuid,
        locationId: location.id,
        customerId: customer.id,
        total,
        status,
        createdBy: createdByUser.id,
        finalizedBy: finalizedByUser?.id,
        createdAt: saleDate,
        items: {
          create: [
            { productId: product.id, qty: qtySold, price: product.price },
          ],
        },
      },
    });

    // Update stock and movements only for completed sales
    if (status === "COMPLETE") {
      // Update StockLevel
      const stockRecord = await prisma.stockLevel.findUnique({
        where: {
          productId_locationId: {
            productId: product.id,
            locationId: location.id,
          },
        },
      });

      if (stockRecord) {
        await prisma.stockLevel.update({
          where: { id: stockRecord.id },
          data: { quantity: stockRecord.quantity - qtySold },
        });
      }

      // Add stock movement for sale
      await prisma.stockMovement.create({
        data: {
          movementUuid: `STM-${Date.now()}-${i}-SALE`,
          productId: product.id,
          locationId: location.id,
          delta: -qtySold,
          reason: "SALE",
          refId: sale.id,
          performedBy: finalizedByUser?.id || createdByUser.id,
          createdAt: saleDate,
        },
      });

      // Ledger entry
      await prisma.ledgerEntry.create({
        data: {
          saleId: sale.id,
          customerId: customer.id,
          type: "SALE",
          amount: total,
          description: `Sale ${saleUuid} to ${customer.name}`,
        },
      });
    }

    sales.push({ ...sale, date: saleDate });
  }

  console.log("✅ Sales seeded historically with stock-aware dates");
  return sales;
}

// 9. Seed returns respecting sale dates
async function seedReturns(sales, staffUsers, managers) {
  const returns = [];

  // Pick 20% of completed sales for returns
  const completedSales = sales.filter((s) => s.status === "COMPLETE");
  const salesForReturn = chance.pickset(
    completedSales,
    Math.floor(completedSales.length * 0.2)
  );

  for (const sale of salesForReturn) {
    const saleDetails = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: { items: true, customer: true, location: true },
    });

    // Pick items and quantities to return
    const numItemsToReturn = chance.integer({
      min: 1,
      max: saleDetails.items.length,
    });
    const itemsToReturn = chance.pickset(saleDetails.items, numItemsToReturn);
    let totalReturnAmount = 0;

    const returnItemsData = itemsToReturn.map((item) => {
      const qtyReturn = chance.integer({ min: 1, max: item.qty });
      totalReturnAmount += qtyReturn * item.price;
      return { productId: item.productId, qty: qtyReturn, price: item.price };
    });

    // Return date: between sale creation and Sep 25, 2025
    const returnDate = randomDate(
      new Date(saleDetails.createdAt),
      new Date(2025, 8, 25)
    );

    // Use generateSequentialId for unique returnUuid
    const returnUuid = await generateSequentialId("Return");

    const returnRecord = await prisma.return.create({
      data: {
        returnUuid,
        saleId: sale.id,
        customerId: saleDetails.customerId,
        totalAmount: totalReturnAmount,
        createdAt: returnDate,
        items: { create: returnItemsData },
      },
    });

    // Update stock and movements
    for (const item of returnItemsData) {
      await prisma.stockLevel.upsert({
        where: {
          productId_locationId: {
            productId: item.productId,
            locationId: saleDetails.location.id,
          },
        },
        update: { quantity: { increment: item.qty } },
        create: {
          productId: item.productId,
          locationId: saleDetails.location.id,
          quantity: item.qty,
        },
      });

      await prisma.stockMovement.create({
        data: {
          movementUuid: `STM-${Date.now()}-RETURN-${item.productId}`,
          productId: item.productId,
          locationId: saleDetails.location.id,
          delta: item.qty,
          reason: "RETURN",
          refId: returnRecord.id,
          performedBy: chance.pickone([...staffUsers, ...managers]).id,
          createdAt: returnDate,
        },
      });
    }

    returns.push(returnRecord);
  }

  console.log("✅ Returns seeded historically with unique IDs");
  return returns;
}

// 10. Seed ledger adjustments across time
async function seedLedgerAdjustments(
  purchases,
  sales,
  returns,
  customers,
  vendors
) {
  const adjustments = [];
  for (let i = 0; i < 100; i++) {
    const entityType = chance.pickone(["CUSTOMER", "VENDOR"]);
    const target =
      entityType === "CUSTOMER"
        ? chance.pickone(customers)
        : chance.pickone(vendors);

    // Adjustments should be after relevant events
    const minDate = (() => {
      const related =
        entityType === "CUSTOMER"
          ? chance.pickone(
              [...sales, ...returns].filter((s) => s.customerId === target.id)
            )
          : chance.pickone(
              [...purchases].filter((p) => p.vendorId === target.id)
            );
      return related?.createdAt || new Date("2020-01-01");
    })();

    // Adjustment date: between minDate and Sep 25, 2025
    const adjustmentDate = randomDate(
      new Date(minDate), // ensure valid Date
      new Date(2025, 8, 25) // September 25, 2025
    );

    const amount = chance.floating({ min: -5000, max: 5000, fixed: 2 });
    const description = `${entityType} Ledger Adjustment ${i + 1} for ${
      target.name
    }`;

    adjustments.push({
      [entityType === "CUSTOMER" ? "customerId" : "vendorId"]: target.id,
      type: "ADJUSTMENT",
      amount,
      description,
      createdAt: adjustmentDate,
    });
  }

  await prisma.ledgerEntry.createMany({ data: adjustments });
  console.log("✅ Ledger adjustments seeded historically");
}

async function main() {
  try {
    console.log("🟢 Seeding started...");

    // 1️⃣ Seed branches/locations
    const locations = await seedLocations();

    // 2️⃣ Seed users per branch
    const allUsers = [];
    const branchUsers = {};
    for (const location of locations) {
      const users = await seedUsers(location); // should return { admin, managers, staffUsers }
      branchUsers[location.id] = users;
      allUsers.push(users.admin, ...users.managers, ...users.staffUsers);
    }

    // 3️⃣ Seed categories
    const categories = await seedCategories();

    // 4️⃣ Seed products per branch
    const products = await seedProducts(locations, categories);

    // 5️⃣ Seed vendors
    const vendors = await seedVendors();

    // 6️⃣ Seed Product-Vendor relations
    await seedProductVendors(products, vendors);

    // 7️⃣ Seed customers
    const customers = await seedCustomers();

    // 8️⃣ Seed purchases historically
    const purchases = [];
    for (const location of locations) {
      const users = branchUsers[location.id];
      const locPurchases = await seedPurchases(
        products.filter((p) => p.locationId === location.id),
        vendors,
        [location],
        [...users.managers, ...users.staffUsers],
        users.admin
      );
      purchases.push(...locPurchases);
    }

    // 9️⃣ Seed sales historically
    const sales = [];
    for (const location of locations) {
      const users = branchUsers[location.id];
      const locSales = await seedSales(
        products.filter((p) => p.locationId === location.id),
        customers,
        [location],
        users.managers,
        users.staffUsers
      );
      sales.push(...locSales);
    }

    // 🔟 Seed returns historically
    await seedReturns(
      sales,
      allUsers.filter((u) => u.role === "STAFF"),
      allUsers.filter((u) => u.role === "MANAGER")
    );

    // 1️⃣1️⃣ Seed ledger adjustments
    await seedLedgerAdjustments(purchases, sales, [], customers, vendors);

    console.log("🎉 Seed completed successfully!");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
