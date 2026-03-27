import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateCourseDto } from './create-course.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCourseDto extends PartialType(CreateCourseDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Publish or unpublish this course (admin only)',
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
