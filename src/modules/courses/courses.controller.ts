import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, ParseIntPipe, Query, UploadedFiles, UseInterceptors, UseFilters
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiParam,
  ApiBody, ApiBearerAuth, ApiQuery, ApiConsumes,
} from '@nestjs/swagger';

import { CoursesService } from './courses.service';
import { CreateCourseDto, CreateCourseWithFilesDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RateCourseDto } from './dto/rate-course.dto';

import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import {
  buildPublicFilePath,
  courseUploadOptions,
  IMAGE_PUBLIC_PATH,
    VIDEO_PUBLIC_PATH,
} from 'src/core/config/upload.config';
import { MulterExceptionFilter } from 'src/core/filters/multer-exception.filter';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateCourseWithFilesDto })
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'banner', maxCount: 1 },
        { name: 'introVideo', maxCount: 1 },
      ],
      courseUploadOptions,
    ),
  )
  @Post()
  create(
    @Body() createCourseDto: CreateCourseDto,
    @CurrentUser() user: any,
    @UploadedFiles()
    files?: {
      banner?: Express.Multer.File[];
      introVideo?: Express.Multer.File[];
    },
  ) {
    const bannerFile = files?.banner?.[0];
    const introVideoFile = files?.introVideo?.[0];

    const bannerPath = bannerFile
      ? buildPublicFilePath(IMAGE_PUBLIC_PATH, bannerFile.filename)
      : undefined;

    const introVideoPath = introVideoFile
      ? buildPublicFilePath(VIDEO_PUBLIC_PATH, introVideoFile.filename)
      : undefined;

    return this.coursesService.create(
      user,
      createCourseDto,
      bannerPath,
      introVideoPath,
    );
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.coursesService.search(query);
  }

  @Get('category/:categoryId')
  findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.coursesService.findByCategory(categoryId);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard)
  @Get('my-courses')
  getMyCourses(@CurrentUser('id') studentId: number) {
    return this.coursesService.getMyCourses(studentId);
  }

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

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.update(id, user, updateCourseDto);
  }

  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR)
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.remove(id, user);
  }
}
