import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HomeworkResponseDto {
  @ApiProperty({
    example: 12,
    description: 'Homework ID',
  })
  id: number;

  @ApiProperty({
    example: 'Homework 1: Arrays and Loops',
    description: 'Homework title',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Solve tasks 1-5 from the worksheet',
    description: 'Optional homework description',
  })
  description?: string | null;

  @ApiPropertyOptional({
    example: '/uploads/homeworks/1711528300-uuid.pdf',
    description: 'File URL if attachment is provided',
  })
  fileUrl?: string | null;
}
