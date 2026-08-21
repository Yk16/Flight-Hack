const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding services...');

  // Find or create a verified provider user
  let provider = await prisma.user.findFirst({ where: { isProvider: true, status: 'VERIFIED' } });
  if (!provider) {
    provider = await prisma.user.create({
      data: {
        name: 'Seed Provider',
        email: `provider+${Date.now()}@example.com`,
        status: 'VERIFIED',
        isProvider: true,
        isOwner: true,
      },
    });
    console.log('Created provider user', provider.id);
  } else {
    console.log('Found existing provider', provider.id);
  }

  // Create sample service listings
  const samples = [
    {
      providerId: provider.id,
      type: 'MAID',
      title: 'Seed: Professional House Cleaning',
      description: 'Seeded cleaning service',
      price: 600,
      pricingModel: 'PER_JOB',
      images: JSON.stringify(['https://images.unsplash.com/photo-1563453392-de3fee36e75b?w=800']),
    },
    {
      providerId: provider.id,
      type: 'COOK',
      title: 'Seed: Daily Home Cooking',
      description: 'Seeded cooking service',
      price: 1500,
      pricingModel: 'PER_MONTH',
      images: JSON.stringify(['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800']),
    },
  ];

  for (const s of samples) {
    await prisma.serviceProvider.create({ data: s });
  }

  console.log('Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
