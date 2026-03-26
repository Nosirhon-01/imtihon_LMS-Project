import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLessonDto {
  @ApiPropertyOptional({
    example: 'Lesson 1: Variables and Data Types',
    description: 'Lesson name',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Learn about variables and data types',
    description: 'Lesson description',
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/video.mp4',
    description: 'Video URL',
  })
  @IsString()
  @IsOptional()
  video?: string;
}
