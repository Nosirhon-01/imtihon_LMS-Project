import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
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
}

export class CreateQuestionWithFileDto extends CreateQuestionDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional file attachment (pdf, image, etc.)',
  })
  file?: any;
}
