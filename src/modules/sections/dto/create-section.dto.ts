import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({
    example: 'Introduction to TypeScript',
    description: 'Section name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Course ID',
  })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}
