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
      include: {
        section: true,
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
      where: { sectionId: lesson.sectionId },
      orderBy: { createdAt: 'desc' },
      select: {
        task: true,
      },
    });

    if (!homework) {
      throw new NotFoundException('Homework not found');
    }

    return {
      lessonId,
      title: homework.task,
      description: null,
    };
  }

  async create(
    mentorId: number,
    createHomeworkDto: CreateHomeworkDto,
    fileUrl?: string,
  ) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: createHomeworkDto.sectionId },
      include: {
        course: {
          include: {
            mentor: {
              select: {
                id: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (!this.canAccessCourse(section.course, mentorId)) {
      throw new ForbiddenException('You cannot access this course');
    }

    const homework = await this.prisma.homework.create({
      data: {
        task: createHomeworkDto.title,
        file: fileUrl,
        sectionId: createHomeworkDto.sectionId,
      },
      select: {
        id: true,
        task: true,
        file: true,
      },
    });

    return {
      id: homework.id,
      title: homework.task,
      description: createHomeworkDto.description ?? null,
      fileUrl: homework.file ?? null,
    };
  }

  private canAccessCourse(
    course: { mentorId: number; mentor?: { role: UserRole } | null },
    userId: number,
  ): boolean {
    return course.mentor?.role === UserRole.ADMIN || course.mentorId === userId;
  }
}
