const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function main() {
  console.log("Connecting...");
  await prisma.$connect();
  console.log("Connected!");
  const p = await prisma.property.findFirst();
  console.log("Query complete:", p?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
