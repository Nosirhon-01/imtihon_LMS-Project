import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty({
    example: 'This is the answer to your question',
    description: 'Answer text',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({
    example: 'https://example.com/file.pdf',
    description: 'File URL',
  })
  @IsString()
  @IsOptional()
  file?: string;
}
