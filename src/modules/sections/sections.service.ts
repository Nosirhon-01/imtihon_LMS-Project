import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(private prisma: PrismaService) {}

  async create(mentorId: number, createSectionDto: CreateSectionDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: createSectionDto.courseId },
      include: {
        mentor: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (!this.canAccessCourse(course, mentorId)) {
      throw new ForbiddenException('You cannot access this course');
    }

    return this.prisma.sectionLesson.create({
      data: {
        name: createSectionDto.name,
        courseId: createSectionDto.courseId,
      },
      include: {
        lessons: true,
      },
    });
  }

  async findOne(id: number) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id },
      include: {
        lessons: true,
        course: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    return section;
  }

  async update(mentorId: number, id: number, updateSectionDto: UpdateSectionDto) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (section.course.mentorId !== mentorId) {
      throw new ForbiddenException('You can only update your own sections');
    }

    return this.prisma.sectionLesson.update({
      where: { id },
      data: updateSectionDto,
      include: {
        lessons: true,
      },
    });
  }

  async delete(mentorId: number, id: number) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (section.course.mentorId !== mentorId) {
      throw new ForbiddenException('You can only delete your own sections');
    }

    return this.prisma.sectionLesson.delete({
      where: { id },
    });
  }

  private canAccessCourse(
    course: { mentorId: number; mentor?: { role: UserRole } | null },
    userId: number,
  ): boolean {
    return course.mentor?.role === UserRole.ADMIN || course.mentorId === userId;
  }
}
