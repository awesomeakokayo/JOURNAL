import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

function createPrisma() {
  if (process.env.DATABASE_URL) {
    const adapter = new PrismaNeonHttp(process.env.DATABASE_URL, {});
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

const prisma = createPrisma();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@ccu.edu.ng";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const adminName = process.env.ADMIN_NAME || "Admin";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        fullName: adminName,
        email: adminEmail,
        passwordHash,
        isAdmin: 1,
      },
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log(`Admin user already exists: ${adminEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
