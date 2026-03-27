import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HomeworkLessonResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Lesson ID',
  })
  lessonId: number;

  @ApiProperty({
    example: 'Lesson 1 Homework',
    description: 'Homework title',
  })
  title: string;

  @ApiPropertyOptional({
    example: 'Solve all exercises in chapter 1',
    description: 'Optional homework description',
  })
  description?: string | null;
}
