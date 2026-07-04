import { prisma } from "../src/lib/prisma"; // Reuses our environment-adaptive driver setup
import bcrypt from "bcrypt";

async function main() {
  const adminEmail = "admin@test.com";
  const hashedPassword = await bcrypt.hash("ClooverAdmin2026!", 12);

  console.log("🌱 Starting database seeding process...");

  // Use upsert to guarantee idempotency (prevents crashing if run multiple times)
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword, // Updates the password if the user already exists
    },
    create: {
      email: adminEmail,
      name: "Cloover Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Database successfully seeded. Target: ${admin.email} (${admin.role})`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding runtime failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Gracefully drop the driver connections so the CLI process exits cleanly
    await prisma.$disconnect();
  });
  