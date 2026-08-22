import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 3 Indian test users...');

  const passwordHash = await bcryptjs.hash('Password@123', 10);

  const usersData = [
    {
      email: 'ananya.sharma@settlemate.com',
      passwordHash,
      name: 'Ananya Sharma',
      phone: '+919876543213',
      status: 'VERIFIED',
      aadhaarVerified: true,
      panVerified: true,
      trustScore: 94,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    },
    {
      email: 'aarav.sharma@settlemate.com',
      passwordHash,
      name: 'Aarav Sharma',
      phone: '+919876543210',
      status: 'VERIFIED',
      aadhaarVerified: true,
      panVerified: true,
      trustScore: 92,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    },
    {
      email: 'priya.patel@settlemate.com',
      passwordHash,
      name: 'Priya Patel',
      phone: '+919876543211',
      status: 'VERIFIED',
      aadhaarVerified: true,
      panVerified: true,
      trustScore: 95,
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    },
    {
      email: 'rohit.verma@settlemate.com',
      passwordHash,
      name: 'Rohit Verma',
      phone: '+919876543212',
      isOwner: true,
      status: 'VERIFIED',
      aadhaarVerified: true,
      panVerified: true,
      trustScore: 88,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        phone: u.phone,
        passwordHash: u.passwordHash,
        status: u.status,
        trustScore: u.trustScore,
        avatar: u.avatar,
      },
      create: u,
    });

    console.log(`Created/Updated User: ${user.name} (${user.email}) - ID: ${user.id}`);

    // Create FlatmateProfile so they are discoverable in Flatmates list
    await prisma.flatmateProfile.upsert({
      where: { userId: user.id },
      update: {
        budget: u.name.includes('Aarav') ? 18000 : u.name.includes('Priya') ? 22000 : 25000,
        city: 'Ahmedabad',
        state: 'Gujarat',
        preferredLocation: 'Navrangpura / Satellite',
        occupation: u.name.includes('Aarav') ? 'Software Engineer' : u.name.includes('Priya') ? 'UI/UX Designer' : 'Financial Analyst',
        bio: `Hi, I'm ${user.name}! Looking for friendly, respectful flatmates near commercial hubs.`,
        lifestyle: JSON.stringify(['vegetarian', 'non-smoker', 'early-riser']),
        lookingFor: JSON.stringify(['professional', 'clean', 'working']),
      },
      create: {
        userId: user.id,
        budget: u.name.includes('Aarav') ? 18000 : u.name.includes('Priya') ? 22000 : 25000,
        city: 'Ahmedabad',
        state: 'Gujarat',
        preferredLocation: 'Navrangpura / Satellite',
        occupation: u.name.includes('Aarav') ? 'Software Engineer' : u.name.includes('Priya') ? 'UI/UX Designer' : 'Financial Analyst',
        bio: `Hi, I'm ${user.name}! Looking for friendly, respectful flatmates near commercial hubs.`,
        lifestyle: JSON.stringify(['vegetarian', 'non-smoker', 'early-riser']),
        lookingFor: JSON.stringify(['professional', 'clean', 'working']),
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
