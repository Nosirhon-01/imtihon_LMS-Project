import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto, RegisterWithImageDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Express } from 'express';
import {
  buildPublicFilePath,
  imageUploadOptions,
  IMAGE_PUBLIC_PATH,
} from 'src/core/config/upload.config';
import { MulterExceptionFilter } from 'src/core/filters/multer-exception.filter';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Create a new user account with phone number and password',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterWithImageDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        phone: '+998901234567',
        fullName: 'John Doe',
        role: 'STUDENT',
        createdAt: '2024-03-16T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input or phone already exists',
  })
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  @Post('register')
  register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    const imagePath = image
      ? buildPublicFilePath(IMAGE_PUBLIC_PATH, image.filename)
      : undefined;
    return this.authService.register(registerDto, imagePath);
  }

  @ApiOperation({
    summary: 'Login user',
    description: 'Authenticate user with phone and password, returns JWT token',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT access token',
    schema: {
      example: {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          phone: '+998901234567',
          fullName: 'John Doe',
          role: 'STUDENT',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid phone or password',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
