import { IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  image?: string;
}

export class UpdateRoleDto {
  @IsString()
  role: UserRole;
}
