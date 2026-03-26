import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PurchaseCourseDto } from './dto/purchase-course.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async purchaseCourse(studentId: number, dto: PurchaseCourseDto) {
    const { courseId, paidVia, amount } = dto;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const alreadyPurchased = await this.prisma.purchasedCourse.findUnique({
      where: {
        courseId_userId: {
          courseId,
          userId: studentId,
        },
      },
    });

    if (alreadyPurchased) {
      throw new BadRequestException(
        'You have already purchased this course. Use GET /courses/my-courses to view it.',
      );
    }


    await this.prisma.purchasedCourse.create({
      data: {
        courseId,
        userId: studentId,
        amount,
        paidVia,
      },
    });


    await this.prisma.assignedCourse.create({
      data: {
        courseId,
        userId: studentId,
      },
    });

    return { message: 'Course purchased successfully' };
  }

  async getMyPurchasedCourses(studentId: number) {
    const purchases = await this.prisma.purchasedCourse.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: {
            mentor: {
              select: {
                id: true,
                fullName: true,
                image: true,
              },
            },
            category: true,
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    return purchases;
  }

  async getPaymentHistory(studentId: number) {
    const history = await this.prisma.purchasedCourse.findMany({
      where: { userId: studentId },
      select: {
        courseId: true,
        userId: true,
        amount: true,
        paidVia: true,
        purchasedAt: true,
        course: {
          select: {
            id: true,
            name: true,
            banner: true,
          },
        },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    return history;
  }
}
