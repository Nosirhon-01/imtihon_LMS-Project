import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { PaidVia } from '@prisma/client';

export class CoursePaymentDto {
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @IsEnum(PaidVia)
  paidVia: PaidVia;

  @IsNumber()
  @Min(0)
  amount: number;
}
