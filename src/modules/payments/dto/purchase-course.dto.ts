import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { PaidVia } from '@prisma/client';

export class PurchaseCourseDto {
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @IsEnum(PaidVia)
  paidVia: PaidVia;

  @IsNumber()
  @Min(0)
  amount: number;
}
