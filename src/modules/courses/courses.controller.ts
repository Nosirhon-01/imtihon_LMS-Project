import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RateCourseDto } from './dto/rate-course.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiOperation({ summary: 'Create a new course (Mentor only)' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only mentors can create courses' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Post()
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.coursesService.create(mentorId, createCourseDto);
  }

  @ApiOperation({ summary: 'Get all available courses' })
  @ApiResponse({
    status: 200,
    description: 'List of all courses with category and mentor information',
  })
  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @ApiOperation({ summary: 'Search courses by name or description' })
  @ApiQuery({
    name: 'q',
    type: 'string',
    description: 'Search query',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Search results' })
  @Get('search')
  search(@Query('q') query: string) {
    return this.coursesService.search(query);
  }

  @ApiOperation({ summary: 'Get courses by category' })
  @ApiParam({ name: 'categoryId', type: 'number' })
  @ApiResponse({ status: 200, description: 'Courses in category' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @Get('category/:categoryId')
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.coursesService.findByCategory(categoryId);
  }

  @ApiOperation({ summary: 'Get all courses purchased by the current student' })
  @ApiResponse({
    status: 200,
    description: 'List of courses purchased by the authenticated student',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('my-courses')
  getMyCourses(@CurrentUser('id') studentId: number) {
    return this.coursesService.getMyCourses(studentId);
  }

  @ApiOperation({ summary: 'Get course details with sections and lessons (Purchased Students Only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'Course details with sections and lessons',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Must purchase course to view details',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') studentId: number,
  ) {
    return this.coursesService.findOne(id, studentId);
  }

  @ApiOperation({ summary: 'Get all lessons for a course grouped by section (Purchased Students Only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Course ID' })
  @ApiResponse({
    status: 200,
    description: 'List of lessons grouped by sections',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Must purchase course to view lessons',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get(':id/lessons')
  getCourseLessons(
    @Param('id', ParseIntPipe) courseId: number,
    @CurrentUser('id') studentId: number,
  ) {
    return this.coursesService.getCourseLessons(courseId, studentId);
  }

  @ApiOperation({ summary: 'Rate a course (Students only)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Course ID' })
  @ApiBody({ type: RateCourseDto })
  @ApiResponse({ status: 201, description: 'Course rated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - User must purchase course first' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only students can rate courses' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post(':id/rate')
  rateCourse(
    @Param('id', ParseIntPipe) courseId: number,
    @Body() rateCourseDto: RateCourseDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.coursesService.rateCourse(courseId, userId, rateCourseDto);
  }

  @ApiOperation({ summary: 'Update course details (Mentor Only - Own Courses)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Course ID' })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only update your own courses',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found or you are not the owner',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.coursesService.update(id, mentorId, updateCourseDto);
  }

  @ApiOperation({ summary: 'Delete a course (Mentor Only - Own Courses)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Authentication required' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - You can only delete your own courses',
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found or you are not the owner',
  })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.coursesService.remove(id, mentorId);
  }
}
