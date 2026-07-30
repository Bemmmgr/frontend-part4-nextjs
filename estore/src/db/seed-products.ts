import "dotenv/config";
import { createPrismaClient } from "./prisma";
import sampleData from "./sample-data";

const prisma = createPrismaClient();

async function main() {
  for (const product of sampleData.products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(`${sampleData.products.length} products seeded successfully!`);
}

main()
  .catch((error) => {
    console.error("Product seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
