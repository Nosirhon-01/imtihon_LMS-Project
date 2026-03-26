import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseCategoryDto } from './dto/create-course-category.dto';
import { UpdateCourseCategoryDto } from './dto/update-course-category.dto';


@Injectable()
export class CourseCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCourseCategoryDto: CreateCourseCategoryDto) {
    const existing = await this.prisma.courseCategory.findUnique({
      where: { name: createCourseCategoryDto.name },
    });

    if (existing) {
      throw new ConflictException(
        'Category with this name already exists',
      );
    }

    return this.prisma.courseCategory.create({
      data: createCourseCategoryDto,
    });
  }

  async findAll() {
    return this.prisma.courseCategory.findMany();
  }

  async findOne(id: number) {
    const category = await this.prisma.courseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  
  async update(
    id: number,
    updateCourseCategoryDto: UpdateCourseCategoryDto,
  ) {
   
    await this.findOne(id);

    return this.prisma.courseCategory.update({
      where: { id },
      data: updateCourseCategoryDto,
    });
  }

  
  async remove(id: number) {
   
    await this.findOne(id);

    return this.prisma.courseCategory.delete({
      where: { id },
    });
  }
}

