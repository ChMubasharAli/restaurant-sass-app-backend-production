import prisma from "../src/config/database.js";
import * as crypto from "crypto";

// Simple password hashing function
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  // Create default admin user
  const adminPassword = hashPassword("admin123");

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: adminPassword, role: "admin" },
  });

  console.log("✅ Admin user seeded:");
  console.log("   Username: admin");
  console.log("   Password: admin123");
  console.log("   Hash:", adminPassword);

  await prisma.restaurantSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "My Restaurant",
      contactNumber: "+1234567890",
      address: "123 Main Street, City, Country",
      latitude: 0,
      longitude: 0,
      deliveryRadiusKm: 5,
      isOpen: true,
    },
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
