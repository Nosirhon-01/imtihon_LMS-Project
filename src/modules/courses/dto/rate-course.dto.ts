import { IsInt, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RateCourseDto {
  @ApiProperty({
    example: 5,
    description: 'Rating value from 1 to 5',
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rate: number;

  @ApiPropertyOptional({
    example: 'Great course! Learned a lot.',
    description: 'Optional rating comment',
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
