import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CoursePaymentDto } from './dto/course-payment.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Purchase course (Student only)' })
  @ApiResponse({ status: 201, description: 'Course purchased' })
  @ApiResponse({
    status: 400,
    description: 'Already purchased or payment is insufficient',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Post('purchase-course')
  purchaseCourse(
    @Body() coursePaymentDto: CoursePaymentDto,
    @CurrentUser('id') studentId: number,
  ) {
    return this.paymentsService.purchaseCourse(studentId, coursePaymentDto);
  }

  @ApiOperation({ summary: 'Get my purchased courses' })
  @ApiResponse({ status: 200, description: 'List of purchased courses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get('my-courses')
  getMyPurchasedCourses(@CurrentUser('id') studentId: number) {
    return this.paymentsService.getMyPurchasedCourses(studentId);
  }

  @ApiOperation({ summary: 'Get payment history' })
  @ApiResponse({ status: 200, description: 'Payment history' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.STUDENT)
  @Get('history')
  getPaymentHistory(@CurrentUser('id') studentId: number) {
    return this.paymentsService.getPaymentHistory(studentId);
  }
}
