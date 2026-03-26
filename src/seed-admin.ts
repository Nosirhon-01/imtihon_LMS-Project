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
      console.log('✓ Admin user updated with new password:');
      console.log(`  ID: ${updated.id}`);
      console.log(`  Phone: ${updated.phone}`);
      console.log(`  Role: ${updated.role}`);
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

    console.log('✓ Admin user created successfully:');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Phone: ${admin.phone}`);
    console.log(`  Password: ${plainPassword} (hashed)`);
    console.log(`  Role: ${admin.role}`);
    console.log(`  Created: ${admin.createdAt}`);
    console.log('\n✓ You can now login with:');
    console.log(`  Phone: ${phone}`);
    console.log(`  Password: ${plainPassword}`);
  } catch (error) {
    console.error('✗ Error seeding admin:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
