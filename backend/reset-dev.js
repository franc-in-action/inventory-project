import { execSync } from "child_process";
import path from "path";

const run = (command, options = {}) => {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: "inherit", ...options });
  } catch (err) {
    console.error(`Error executing: ${command}`);
    process.exit(1);
  }
};

const rootDir = path.resolve();

console.log("=== Resetting development environment ===");

// 1️⃣ Delete old migrations
run(`rm -rf ${rootDir}/prisma/migrations/*`);

// 2️⃣ Create fresh initial migration (applies to DB)
run(`npx prisma migrate dev --name init`);

// 3️⃣ Run seed script
run(`node ${rootDir}/prisma/seed.js`);

// 4️⃣ Run tests
run(`npm test`);

console.log("\n✅ Development environment reset complete.");
