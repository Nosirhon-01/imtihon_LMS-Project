import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonDto {
  @ApiProperty({
    example: 'Lesson 1: Variables and Data Types',
    description: 'Lesson name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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

  @ApiProperty({
    example: 1,
    description: 'Section ID',
  })
  @IsNumber()
  @IsNotEmpty()
  sectionId: number;
}
