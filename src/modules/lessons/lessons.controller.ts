import { Controller, Post, Get, Param, Body, Patch, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { AddLessonFileDto } from './dto/add-lesson-file.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @ApiOperation({ summary: 'Create lesson (Mentor only)' })
  @ApiResponse({ status: 201, description: 'Lesson created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Post()
  create(
    @Body() createLessonDto: CreateLessonDto,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.lessonsService.create(mentorId, createLessonDto);
  }

  @ApiOperation({
    summary: 'Get lesson details by ID (Enrolled Students Only)',
    description: 'Returns detailed information about a specific lesson. Only students who have purchased the course can access it.',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson details with files and metadata',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Must purchase course to access lesson',
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get(':id')
  getLessonDetails(
    @Param('id', ParseIntPipe) lessonId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.lessonsService.findOne(lessonId, userId);
  }

  @ApiOperation({ summary: 'Update lesson (Mentor only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Lesson updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.lessonsService.update(mentorId, id, updateLessonDto);
  }

  @ApiOperation({ summary: 'Delete lesson (Mentor only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Lesson deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.lessonsService.delete(mentorId, id);
  }

  @ApiOperation({
    summary: 'Get all lesson files by lesson ID (Enrolled Students Only)',
    description: 'Returns all attached files (PDFs, source code, documents) for a specific lesson. Only students who have purchased the course can access it.',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Lesson ID' })
  @ApiResponse({
    status: 200,
    description: 'List of lesson files with URLs and metadata',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Must purchase course to access files',
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get(':id/files')
  getLessonFiles(
    @Param('id', ParseIntPipe) lessonId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.lessonsService.getLessonFiles(lessonId, userId);
  }

  @ApiOperation({ summary: 'Add file to lesson (Mentor only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 201, description: 'File added' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Post(':id/files')
  addFile(
    @Param('id', ParseIntPipe) lessonId: number,
    @Body() addFileDto: AddLessonFileDto,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.lessonsService.addFile(mentorId, lessonId, addFileDto);
  }

  @ApiOperation({ summary: 'Delete lesson file (Mentor only)' })
  @ApiParam({ name: 'fileId', type: 'number' })
  @ApiResponse({ status: 200, description: 'File deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Delete('files/:fileId')
  deleteFile(
    @Param('fileId', ParseIntPipe) fileId: number,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.lessonsService.deleteFile(mentorId, fileId);
  }

  @ApiOperation({
    summary: 'Mark lesson as viewed by the current student',
    description: 'Creates or updates lesson view record to track student progress',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'Lesson ID' })
  @ApiResponse({
    status: 201,
    description: 'Lesson view tracked successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Post(':id/view')
  trackView(
    @Param('id', ParseIntPipe) lessonId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.lessonsService.trackLessonView(lessonId, userId);
  }
}
