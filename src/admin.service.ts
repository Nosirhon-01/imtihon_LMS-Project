import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async createAdmin(phone: string, password: string, fullName: string) {
    try {
      const existingAdmin = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingAdmin) {
        return {
          success: false,
          message: `User with phone ${phone} already exists`,
          user: existingAdmin,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await this.prisma.user.create({
        data: {
          phone,
          password: hashedPassword,
          role: UserRole.ADMIN,
          fullName,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: admin.id,
          phone: admin.phone,
          role: admin.role,
          fullName: admin.fullName,
          createdAt: admin.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Error creating admin: ${error.message}`,
        error: error.message,
      };
    }
  }
}
