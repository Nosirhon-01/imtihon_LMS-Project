import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionDto {
  @ApiPropertyOptional({
    example: 'Introduction to TypeScript',
    description: 'Section name',
  })
  @IsString()
  @IsOptional()
  name?: string;
}
