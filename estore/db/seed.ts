import "dotenv/config";
import { createPrismaClient } from "../src/db/prisma";
import sampleData from "./sample-data";

// 021 - seed sample data - 开发库初始化工作
const prisma = createPrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.product.createMany({ data: sampleData.products });
  console.log("Database seeded successfully!");
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
