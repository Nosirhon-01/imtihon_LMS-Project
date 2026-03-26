import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLessonViewDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Mark lesson as viewed',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  view?: boolean = true;
}
