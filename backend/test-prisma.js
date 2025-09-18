import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany({
    include: { location: true },
  });
  console.log(users);

  const products = await prisma.product.findMany({
    include: { location: true },
  });
  console.log(products);
}

test();
