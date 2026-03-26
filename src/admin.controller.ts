import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(
    @Body() body: { phone: string; password: string; fullName: string },
  ) {
    return this.adminService.createAdmin(
      body.phone,
      body.password,
      body.fullName,
    );
  }
}
