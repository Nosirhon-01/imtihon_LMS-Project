import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { CurrentUser } from 'src/core/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @ApiOperation({ summary: 'Create section (Mentor only)' })
  @ApiResponse({ status: 201, description: 'Section created' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only mentors' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Post()
  create(
    @Body() createSectionDto: CreateSectionDto,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.sectionsService.create(mentorId, createSectionDto);
  }

  @ApiOperation({ summary: 'Get section details' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Section details' })
  @ApiResponse({ status: 404, description: 'Section not found' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sectionsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update section (Mentor only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Section updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectionDto: UpdateSectionDto,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.sectionsService.update(mentorId, id, updateSectionDto);
  }

  @ApiOperation({ summary: 'Delete section (Mentor only)' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Section deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  @ApiBearerAuth('JWT')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @Delete(':id')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') mentorId: number,
  ) {
    return this.sectionsService.delete(mentorId, id);
  }
}
