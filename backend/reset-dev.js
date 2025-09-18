// reset-dev.js
import { execSync } from "child_process";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const run = (command) => {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: "inherit" });
  } catch (err) {
    console.error(`Error executing: ${command}`);
    process.exit(1);
  }
};

const rootDir = path.resolve();

console.log("=== Resetting development environment ===");

// 1️⃣ Delete old Prisma migrations
console.log("\nDeleting old Prisma migrations...");
run(`rm -rf ${rootDir}/prisma/migrations/*`);

// 2️⃣ Create fresh initial migration (applies to DB and generates tables)
console.log("\nCreating fresh initial migration...");
run(`npx prisma migrate dev --name init`);

// 3️⃣ Run seed script (tables now exist)
console.log("\nSeeding database...");
run(`node ${rootDir}/prisma/seed.js`);

// 4️⃣ Run tests
console.log("\nRunning tests...");
run(`npm test`);

console.log("\n✅ Development environment reset complete.");
