import { prisma } from "./src/lib/prismaDB";

async function main() {
  const c = await prisma.sensors_new.count();
  console.log("sensors_new:", c);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
