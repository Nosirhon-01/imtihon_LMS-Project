import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLessonViewDto } from './dto/create-lesson-view.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AddLessonFileDto } from './dto/add-lesson-file.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: number, userId?: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        about: true,
        video: true,
        section: {
          select: {
            courseId: true,
          },
        },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    if (userId) {
      const courseId = lesson.section.courseId;
      const hasAccess = await this.checkStudentAccess(userId, courseId);
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this lesson. Please purchase the course first.',
        );
      }
    }

    return {
      id: lesson.id,
      name: lesson.name,
      about: lesson.about,
      video: lesson.video,
    };
  }

  async getLessonFiles(lessonId: number, userId?: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    if (userId) {
      const courseId = lesson.section.course.id;
      const hasAccess = await this.checkStudentAccess(userId, courseId);
      if (!hasAccess) {
        throw new ForbiddenException(
          'You do not have access to this lesson. Please purchase the course first.',
        );
      }
    }

    const files = await this.prisma.lessonFile.findMany({
      where: { lessonId },
      select: {
        id: true,
        fileUrl: true,
        note: true,
        createdAt: true,
      },
    });

    return {
      lessonId,
      lessonName: lesson.name,
      files,
      totalFiles: files.length,
    };
  }

  async trackLessonView(lessonId: number, userId: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');

    const courseId = lesson.section.course.id;
    const hasAccess = await this.checkStudentAccess(userId, courseId);
    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have access to this course. Please purchase it first.',
      );
    }

    const lessonView = await this.prisma.lessonView.upsert({
      where: {
        lessonId_userId: {
          lessonId,
          userId,
        },
      },
      create: {
        lessonId,
        userId,
        view: true,
      },
      update: {
        view: true,
      },
    });

    const lastActivityWhere = {
      userId_courseId_lessonId_sectionId: {
        userId,
        courseId,
        lessonId,
        sectionId: lesson.section.id,
      },
    };

    await this.prisma.lastActivity.updateMany({
      where: {
        userId,
        courseId,
        lessonId,
        sectionId: lesson.section.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    const existingActivity = await this.prisma.lastActivity.findFirst({
      where: {
        userId,
        courseId,
        lessonId,
        sectionId: lesson.section.id,
      },
    });

    if (!existingActivity) {
      await this.prisma.lastActivity.create({
        data: {
          userId,
          courseId,
          lessonId,
          sectionId: lesson.section.id,
        },
      });
    }

    return lessonView;
  }

  async createLesson(
    mentorId: number,
    createLessonDto: CreateLessonDto,
    videoPath?: string,
  ) {
    const section = await this.prisma.sectionLesson.findUnique({
      where: { id: createLessonDto.sectionId },
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

    return this.prisma.lesson.create({
      data: {
        name: createLessonDto.name,
        about: createLessonDto.about,
        video: videoPath ?? null,
        sectionId: createLessonDto.sectionId,
      },
    });
  }

  async create(
    mentorId: number,
    createLessonDto: CreateLessonDto,
    videoPath?: string,
  ) {
    return this.createLesson(mentorId, createLessonDto, videoPath);
  }

  async update(mentorId: number, id: number, updateLessonDto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.section.course.mentorId !== mentorId) {
      throw new ForbiddenException('You can only update your own lessons');
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  async delete(mentorId: number, id: number) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.section.course.mentorId !== mentorId) {
      throw new ForbiddenException('You can only delete your own lessons');
    }

    return this.prisma.lesson.delete({
      where: { id },
    });
  }

  async addFile(mentorId: number, lessonId: number, addFileDto: AddLessonFileDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (lesson.section.course.mentorId !== mentorId) {
      throw new ForbiddenException('You can only add files to your own lessons');
    }

    return this.prisma.lessonFile.create({
      data: {
        fileUrl: addFileDto.fileUrl,
        note: addFileDto.note,
        lessonId,
      },
    });
  }

  async deleteFile(mentorId: number, fileId: number) {
    const file = await this.prisma.lessonFile.findUnique({
      where: { id: fileId },
      include: {
        lesson: {
          include: {
            section: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.lesson.section.course.mentorId !== mentorId) {
      throw new ForbiddenException('You can only delete your own files');
    }

    return this.prisma.lessonFile.delete({
      where: { id: fileId },
    });
  }

  private async checkStudentAccess(userId: number, courseId: number): Promise<boolean> {
    const purchased = await this.prisma.purchasedCourse.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });
    return !!purchased;
  }

  private canAccessCourse(
    course: { mentorId: number; mentor?: { role: UserRole } | null },
    userId: number,
  ): boolean {
    return course.mentor?.role === UserRole.ADMIN || course.mentorId === userId;
  }
}
