import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createQuestionDto: CreateQuestionDto) {

    const course = await this.prisma.course.findUnique({
      where: { id: createQuestionDto.courseId },
    });

    if (!course) throw new NotFoundException('Course not found');

    const question = await this.prisma.question.create({
      data: {
        userId,
        courseId: createQuestionDto.courseId,
        text: createQuestionDto.text,
        file: createQuestionDto.file || null,
        read: false,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return question;
  }

  async findAll(courseId?: number) {
    if (courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) throw new NotFoundException('Course not found');
    }

    const questions = await this.prisma.question.findMany({
      where: courseId ? { courseId } : {},
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        answers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return questions;
  }

  async answerQuestion(mentorId: number, questionId: number, answerDto: AnswerQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        course: true,
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.course.mentorId !== mentorId) {
      throw new ForbiddenException('You can only answer questions for your own courses');
    }

    const answer = await this.prisma.questionAnswer.create({
      data: {
        questionId,
        userId: mentorId,
        text: answerDto.text,
        file: answerDto.file || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            image: true,
          },
        },
      },
    });

    await this.prisma.question.update({
      where: { id: questionId },
      data: { read: true, readAt: new Date() },
    });

    return answer;
  }

  async deleteQuestion(userId: number, questionId: number) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.userId !== userId) {
      throw new ForbiddenException('You can only delete your own questions');
    }

    return this.prisma.question.delete({
      where: { id: questionId },
    });
  }
}
