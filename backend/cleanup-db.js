const prisma = require('./prisma/client');

async function main() {
  console.log('🧹 Starting Database Cleanup...');

  try {
    // Delete in order to respect foreign key constraints
    console.log('- Clearing OrderItems...');
    await prisma.orderItem.deleteMany();

    console.log('- Clearing Orders...');
    await prisma.order.deleteMany();

    console.log('- Clearing Products...');
    await prisma.product.deleteMany();

    console.log('- Clearing Categories...');
    await prisma.category.deleteMany();

    console.log('- Clearing Users...');
    await prisma.user.deleteMany();

    console.log('✅ Database is now CLEAN.');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
