import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: '+998901234567',
    description: 'User phone number (unique)',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password minium 6 ta ',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'User full name',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;
}

export class RegisterWithImageDto extends RegisterDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Profile image file (jpg, jpeg, png, webp)',
  })
  image?: any;
}
