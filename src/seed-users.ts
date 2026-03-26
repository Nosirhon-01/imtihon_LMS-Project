import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/lms_db?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface UserSeed {
  phone: string;
  fullName: string;
  role: UserRole;
}

const usersToSeed: UserSeed[] = [
  {
    phone: '+998200107740',
    fullName: 'Admin User',
    role: UserRole.ADMIN,
  },
  {
    phone: '+998901234567',
    fullName: 'Mentor User',
    role: UserRole.MENTOR,
    
  },
  {
    phone: '+998901234568',
    fullName: 'Student User',
    role: UserRole.STUDENT,
  },
];

async function seedUsers() {
  try {
    const plainPassword = '123456';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    let createdCount = 0;
    let updatedCount = 0;

    for (const userSeed of usersToSeed) {
      const existingUser = await prisma.user.findUnique({
        where: { phone: userSeed.phone },
      });

      if (existingUser) {
        await prisma.user.update({
          where: { phone: userSeed.phone },
          data: {
            password: hashedPassword,
            role: userSeed.role,
          },
        });
        console.log(`✓ Updated: ${userSeed.role} - ${userSeed.phone} (${userSeed.fullName})`);
        updatedCount++;
      } else {
        await prisma.user.create({
          data: {
            phone: userSeed.phone,
            password: hashedPassword,
            role: userSeed.role,
            fullName: userSeed.fullName,
          },
        });
        console.log(`✓ Created: ${userSeed.role} - ${userSeed.phone} (${userSeed.fullName})`);
        createdCount++;
      }
    }

    console.log(`\n✓ Seeding complete: ${createdCount} created, ${updatedCount} updated`);
    console.log(`✓ All users can login with password: ${plainPassword}`);
  } catch (error) {
    console.error('✗ Error seeding users:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedUsers();
