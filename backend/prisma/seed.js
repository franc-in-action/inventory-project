import { PrismaClient } from "../generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
    // Create a Location
    const location = await prisma.location.create({
        data: {
            name: "Main Branch",
            address: "Downtown"
        },
    });

    // Create an Admin User
    await prisma.user.create({
        data: {
            email: "admin@example.com",
            password: "hashed-password", // TODO: hash with bcrypt
            name: "System Admin",
            role: "ADMIN",
            locationId: location.id
        },
    });

    // Add a sample Product
    await prisma.product.create({
        data: {
            name: "Test Product",
            sku: "SKU-001",
            quantity: 100,
            price: 50.0,
            locationId: location.id
        },
    });
}

main()
    .then(() => {
        console.log("Seed data inserted.");
        process.exit(0);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
