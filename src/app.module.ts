import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CourseCategoriesModule } from './modules/course-categories/course-categories.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LessonsModule } from './modules/lessons/lessons.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { SectionsModule } from './modules/sections/sections.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    CourseCategoriesModule,
    CoursesModule,
    PaymentsModule,
    LessonsModule,
    QuestionsModule,
    SectionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


