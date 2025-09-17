// reset-admin-password.js
import { PrismaClient } from "./generated/prisma/index.js";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const newPassword = "password"; // the password you want

  const hashed = await bcrypt.hash(newPassword, 10);

  const updated = await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  console.log("Admin password reset for:", updated.email);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
