import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: '+998901234567',
    description: 'User telefon raqami',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password minimum 6 ta narsa yozsh kere',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
