import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddLessonFileDto {
  @ApiProperty({
    example: 'https://example.com/file.pdf',
    description: 'File URL',
  })
  @IsString()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({
    example: 'Lecture notes',
    description: 'File description',
  })
  @IsString()
  @IsNotEmpty()
  note: string;
}
