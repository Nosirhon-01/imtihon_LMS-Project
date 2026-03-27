import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT ?? 3000;

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              
      forbidNonWhitelisted: true,    
      transform: true,              
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('LMS Backend API')
    .setDescription('Learning Management System Backend API Documentation - Production Ready')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .addTag('Auth', 'Authentication endpoints - Register and Login')
    .addTag('course-categories', 'Course Category Management - ADMIN only for create/update/delete')
    .addTag('Courses', 'Course management endpoints - Create, Read, Update, Delete')
    .addTag('Lessons', 'Lesson tracking endpoints - View lessons and track progress')
    .addTag('Questions', 'Question and answer endpoints - Ask and answer course questions')
    .addTag('Payments', 'Payment endpoints - Purchase courses')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(port);

  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs\n`);

;
}
bootstrap();
