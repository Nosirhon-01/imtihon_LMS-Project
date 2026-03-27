import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto, CreateHomeworkWithFileDto } from './dto/create-homework.dto';
import { HomeworkResponseDto } from './dto/homework-response.dto';
import { HomeworkLessonResponseDto } from './dto/homework-lesson-response.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import {
  buildPublicFilePath,
  HOMEWORK_PUBLIC_PATH,
  homeworkUploadOptions,
} from 'src/core/config/upload.config';
import { MulterExceptionFilter } from 'src/core/filters/multer-exception.filter';

@ApiTags('Homework')
@Controller('homework')
export class HomeworkController {
  constructor(private readonly homeworkService: HomeworkService) {}

  @ApiOperation({
    summary: 'Get homework by lesson ID (Purchased Students Only)',
    description:
      'Returns homework for a lesson. Only students who purchased the course can access it.',
  })
  @ApiParam({ name: 'lessonId', type: 'number', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Homework data',
    type: HomeworkLessonResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'You did not buy this course',
  })
  @ApiResponse({ status: 404, description: 'Lesson or homework not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get(':lessonId')
  getHomeworkByLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @CurrentUser('id') studentId: number,
  ) {
    return this.homeworkService.getHomeworkByLesson(lessonId, studentId);
  }

  @ApiOperation({ summary: 'Create homework (Mentor only)' })
  @ApiResponse({
    status: 201,
    description: 'Homework created',
    type: HomeworkResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateHomeworkWithFileDto })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(FileInterceptor('file', homeworkUploadOptions))
  @Post()
  create(
    @Body() createHomeworkDto: CreateHomeworkDto,
    @CurrentUser('id') mentorId: number,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const fileUrl = file
      ? buildPublicFilePath(HOMEWORK_PUBLIC_PATH, file.filename)
      : undefined;

    return this.homeworkService.create(mentorId, createHomeworkDto, fileUrl);
  }
}
