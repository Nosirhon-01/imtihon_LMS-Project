import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreateCourseCategoryDto {
  
  @ApiProperty({
    description: 'The name of the course category',
    example: 'Web Development',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({
    message: 'Category name must be a string',
  })
  @IsNotEmpty({
    message: 'Category name is required',
  })
  @MinLength(2, {
    message: 'Category name must be at least 2 characters long',
  })
  @MaxLength(100, {
    message: 'Category name must be at most 100 characters long',
  })
  name: string;
}

