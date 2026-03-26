import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserDto, UpdateRoleDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });
  }

  async updateProfile(id: number, updateData: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    return this.prisma.user.update({
      where: { id },
      data: { role: updateRoleDto.role },
    });
  }

  async delete(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
