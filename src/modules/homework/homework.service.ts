import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateHomeworkDto } from './dto/create-homework.dto';

@Injectable()
export class HomeworkService {
  constructor(private prisma: PrismaService) {}

  async getHomeworkByLesson(lessonId: number, studentId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        section: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const purchased = await this.prisma.purchasedCourse.findUnique({
      where: {
        courseId_userId: {
          courseId: lesson.section.courseId,
          userId: studentId,
        },
      },
    });

    if (!purchased) {
      throw new ForbiddenException('You did not buy this course');
    }

    const homework = await this.prisma.homework.findFirst({
      where: { lessonId },
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        description: true,
      },
    });

    if (!homework) {
      throw new NotFoundException('Homework not found');
    }

    return {
      lessonId,
      title: homework.title,
      description: homework.description ?? null,
    };
  }

  async create(
    mentorId: number,
    createHomeworkDto: CreateHomeworkDto,
    fileUrl?: string,
  ) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: createHomeworkDto.lessonId },
      select: {
        section: {
          select: {
            course: {
              select: {
                mentorId: true,
                mentor: {
                  select: {
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (!this.canAccessCourse(lesson.section.course, mentorId)) {
      throw new ForbiddenException('You cannot access this course');
    }

    const homework = await this.prisma.homework.create({
      data: {
        title: createHomeworkDto.title,
        description: createHomeworkDto.description ?? null,
        fileUrl,
        lessonId: createHomeworkDto.lessonId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
      },
    });

    return {
      id: homework.id,
      title: homework.title,
      description: homework.description ?? null,
      fileUrl: homework.fileUrl ?? null,
    };
  }

  private canAccessCourse(
    course: { mentorId: number; mentor?: { role: UserRole } | null },
    userId: number,
  ): boolean {
    return course.mentor?.role === UserRole.ADMIN || course.mentorId === userId;
  }
}
