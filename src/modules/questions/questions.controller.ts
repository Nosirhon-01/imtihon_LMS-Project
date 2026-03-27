import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Query,
  Delete,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto, CreateQuestionWithFileDto } from './dto/create-question.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import {
  buildPublicFilePath,
  QUESTION_PUBLIC_PATH,
  questionUploadOptions,
} from 'src/core/config/upload.config';
import { MulterExceptionFilter } from 'src/core/filters/multer-exception.filter';

@ApiTags('Questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @ApiOperation({
    summary: 'Create a new question about a course (Students only)',
    description: 'Allows students to ask questions related to a course',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateQuestionWithFileDto })
  @ApiResponse({
    status: 201,
    description: 'Question created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid course ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only students can ask questions' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(FileInterceptor('file', questionUploadOptions))
  @Post()
  create(
    @Body() createQuestionDto: CreateQuestionDto,
    @CurrentUser('id') userId: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const filePath = file
      ? buildPublicFilePath(QUESTION_PUBLIC_PATH, file.filename)
      : undefined;

    return this.questionsService.create(userId, createQuestionDto, filePath);
  }

  @ApiOperation({
    summary: 'Get all questions for a course',
    description: 'Retrieves all questions and their answers for a specific course with optional filtering',
  })
  @ApiQuery({
    name: 'courseId',
    type: 'number',
    description: 'Course ID to filter questions',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of questions for the course',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @Get()
  findAll(@Query('courseId') courseId?: number) {
    return this.questionsService.findAll(courseId);
  }

  @ApiOperation({ summary: 'Answer question (Mentor only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 201, description: 'Answer created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Question not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Post(':id/answer')
  answerQuestion(
    @Param('id', ParseIntPipe) questionId: number,
    @Body() answerDto: AnswerQuestionDto,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.questionsService.answerQuestion(mentorId, questionId, answerDto);
  }

  @ApiOperation({ summary: 'Delete question' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Question deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Delete(':id')
  deleteQuestion(
    @Param('id', ParseIntPipe) questionId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.questionsService.deleteQuestion(userId, questionId);
  }
}
