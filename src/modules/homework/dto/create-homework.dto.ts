import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHomeworkDto {
  @ApiProperty({
    example: 'Homework 1: Arrays and Loops',
    description: 'Homework title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Solve tasks 1-5 from the worksheet',
    description: 'Optional homework description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 3,
    description: 'Section ID this homework belongs to',
  })
  @IsNumber()
  @IsNotEmpty()
  sectionId: number;
}

export class CreateHomeworkWithFileDto extends CreateHomeworkDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional homework attachment (any file type)',
  })
  file?: any;
}
