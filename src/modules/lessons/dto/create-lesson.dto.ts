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

  @ApiProperty({
    example: 1,
    description: 'Section ID',
  })
  @IsNumber()
  @IsNotEmpty()
  sectionId: number;
}

export class CreateLessonWithVideoDto extends CreateLessonDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Lesson video file (mp4, mkv, mov)',
  })
  video?: any;
}
