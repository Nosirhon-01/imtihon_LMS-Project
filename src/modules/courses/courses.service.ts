import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RateCourseDto } from './dto/rate-course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(user: any, createCourseDto: CreateCourseDto) {
    if (user.role !== 'MENTOR' && user.role !== 'ADMIN') {
      throw new ForbiddenException('Only mentor or admin can create course');
    }

    return this.prisma.course.create({
      data: {
        ...createCourseDto,
        mentorId: user.id,
      },
    });
  }

  async findAll() {
    return this.prisma.course.findMany({
      include: {
        category: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
    });
  }

  async findOne(id: number, studentId?: number) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        mentor: {
          select: { id: true, fullName: true, image: true },
        },
        category: true,
        sections: {
          include: { lessons: true },
        },
        _count: {
          select: { ratings: true, purchasedCourses: true },
        },
      },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (studentId) {
      const purchased = await this.prisma.purchasedCourse.findUnique({
        where: {
          courseId_userId: {
            courseId: id,
            userId: studentId,
          },
        },
      });

      if (!purchased) {
        throw new BadRequestException(
          'You must purchase this course to view full details',
        );
      }
    }

    return course;
  }

  async getMyCourses(studentId: number) {
    const purchasedCourses = await this.prisma.purchasedCourse.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: {
            category: true,
            mentor: {
              select: {
                id: true,
                fullName: true,
                image: true,
              },
            },
            sections: {
              include: { lessons: true },
            },
            _count: {
              select: { ratings: true },
            },
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    return purchasedCourses.map((pc) => ({
      ...pc.course,
      purchasedAt: pc.purchasedAt,
      amount: pc.amount,
    }));
  }

  
  async getCourseLessons(courseId: number, studentId?: number) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (studentId) {
      const purchased = await this.prisma.purchasedCourse.findUnique({
        where: {
          courseId_userId: {
            courseId,
            userId: studentId,
          },
        },
      });

      if (!purchased) {
        throw new BadRequestException(
          'You must purchase this course to view its lessons',
        );
      }
    }

    const sections = await this.prisma.sectionLesson.findMany({
      where: { courseId },
      include: {
        lessons: {
          select: {
            id: true,
            name: true,
            about: true,
            video: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      courseId,
      courseName: course.name,
      sections: sections.map((section) => ({
        sectionId: section.id,
        sectionName: section.name,
        lessonCount: section.lessons.length,
        lessons: section.lessons,
      })),
      totalSections: sections.length,
      totalLessons: sections.reduce(
        (acc, section) => acc + section.lessons.length,
        0,
      ),
    };
  }

  async rateCourse(courseId: number, userId: number, rateCourseDto: RateCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) throw new NotFoundException('Course not found');

    const purchased = await this.prisma.purchasedCourse.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId,
        },
      },
    });

    if (!purchased) {
      throw new BadRequestException('You must purchase this course to rate it');
    }

    const existingRating = await this.prisma.rating.findFirst({
      where: {
        courseId,
        userId,
      },
    });

    if (existingRating) {
      return this.prisma.rating.update({
        where: { id: existingRating.id },
        data: {
          rate: rateCourseDto.rate,
          comment: rateCourseDto.comment || null,
        },
      });
    }

    return this.prisma.rating.create({
      data: {
        courseId,
        userId,
        rate: rateCourseDto.rate,
        comment: rateCourseDto.comment || null,
      },
    });
  }

  async update(id: number, user: any, updateCourseDto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (user.role !== 'ADMIN' && course.mentorId !== user.id) {
      throw new ForbiddenException(
        'You can update only your own course',
      );
    }

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
    });
  }

  async remove(id: number, user: any) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) throw new NotFoundException('Course not found');

    if (user.role !== 'ADMIN' && course.mentorId !== user.id) {
      throw new ForbiddenException(
        'You can delete only your own course',
      );
    }

    return this.prisma.course.delete({
      where: { id },
    });
  }

  async search(query: string) {
    return this.prisma.course.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { about: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        category: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
    });
  }

  async findByCategory(categoryId: number) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.course.findMany({
      where: { categoryId },
      include: {
        category: true,
        mentor: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
    });
  }
}