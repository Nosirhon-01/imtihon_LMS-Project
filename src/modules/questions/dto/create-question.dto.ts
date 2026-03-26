import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({
    example: 1,
    description: 'Course ID that the question is related to',
  })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({
    example: 'How do I implement dependency injection in NestJS?',
    description: 'The question text',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    example: 'https://example.com/screenshot.jpg',
    description: 'Optional file attachment URL',
  })
  @IsString()
  @IsOptional()
  file?: string;
}
