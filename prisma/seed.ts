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

  // Create default restaurant settings with opening/closing times
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
      openingTime: "11:00",
      closingTime: "22:00",
      logoUrl: null,
    },
  });

  console.log("✅ Restaurant settings seeded:");
  console.log("   Opening Time: 11:00");
  console.log("   Closing Time: 22:00");
  console.log("   Delivery Radius: 5 KM");

  // Create sample categories
  const categories = [
    { name: "Appetizers", description: "Start your meal right", sortOrder: 1 },
    { name: "Main Course", description: "Hearty main dishes", sortOrder: 2 },
    { name: "Desserts", description: "Sweet endings", sortOrder: 3 },
    { name: "Beverages", description: "Refreshing drinks", sortOrder: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log("✅ Categories seeded");
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
