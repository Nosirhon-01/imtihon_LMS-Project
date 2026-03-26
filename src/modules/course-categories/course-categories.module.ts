import { Module } from '@nestjs/common';
import { CourseCategoriesService } from './course-categories.service';
import { CourseCategoriesController } from './course-categories.controller';

@Module({
  controllers: [CourseCategoriesController],
  providers: [CourseCategoriesService],
})
export class CourseCategoriesModule {}
