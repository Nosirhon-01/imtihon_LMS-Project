import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:1234@localhost:5432/lms_db?schema=public';
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function seedAdmin() {
  try {
    const phone = '+998200107740';
    const plainPassword = '123456';

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const updated = await prisma.user.update({
        where: { phone },
        data: {
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });
    
      return;
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const admin = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        role: UserRole.ADMIN,
        fullName: 'Admin User',
      },
    });


  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
