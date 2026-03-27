import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CourseLevel } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({
    example: 'Advanced TypeScript Patterns',
    description: 'Course name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Learn advanced TypeScript patterns and best practices',
    description: 'Course description',
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiProperty({
    example: 49.99,
    description: 'Course price',
  })
  @IsNumber()
  price: number;

  @ApiProperty({
    enum: CourseLevel,
    example: CourseLevel.INTERMEDIATE,
    description: 'Course difficulty level',
  })
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty({
    example: 1,
    description: 'Category ID',
  })
  @IsNumber()
  categoryId: number;
}

export class CreateCourseWithFilesDto extends CreateCourseDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional course banner image (jpg, png, webp)',
  })
  banner?: any;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional intro video (mp4, mkv, mov)',
  })
  introVideo?: any;
}
