import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CourseCategoriesService } from './course-categories.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { UserRole } from '@prisma/client';


@ApiTags('course-categories')
@Controller('course-categories')
export class CourseCategoriesController {
  constructor(private readonly courseCategoriesService: CourseCategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) 
  @Roles(UserRole.ADMIN) 
  @ApiBearerAuth('JWT') 
  @ApiOperation({
    summary: 'Create a new course category',
    description: 'Only ADMIN users can create categories. Mentors and Students will get 403 Forbidden.',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    example: { id: 1, name: 'Web Development', createdAt: '2026-03-25T10:00:00Z' },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can create categories',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Category with this name already exists',
  })
  create(@Body() createCourseCategoryDto: CreateCourseCategoryDto) {
    return this.courseCategoriesService.create(createCourseCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all course categories',
    description: 'Public endpoint - no authentication required. Anyone can view all categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all categories',
    example: [
      { id: 1, name: 'Web Development', createdAt: '2026-03-25T10:00:00Z' },
      { id: 2, name: 'Mobile Development', createdAt: '2026-03-25T10:01:00Z' },
    ],
  })
  findAll() {
    return this.courseCategoriesService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Update a course category',
    description: 'Only ADMIN users can update categories. Other users will get 403 Forbidden.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID to update',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    example: { id: 1, name: 'Advanced Web Development', createdAt: '2026-03-25T10:00:00Z' },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can update categories',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseCategoryDto: UpdateCourseCategoryDto,
  ) {
    return this.courseCategoriesService.update(id, updateCourseCategoryDto);
  }

  
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) 
  @ApiBearerAuth('JWT')
  @ApiOperation({
    summary: 'Delete a course category',
    description: 'Only ADMIN users can delete categories. This action cannot be undone.',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Category ID to delete',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only ADMIN users can delete categories',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseCategoriesService.remove(id);
  }
}
