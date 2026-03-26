import {
  Body,
  Controller,
  Patch,
  Get,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfessionalService } from './professional.service';
import { UpdateProfessionalSettingsDto } from './dto/update-setting.dto';
import { ProfessionalRoleGuard } from './guards/professional-role.guard';

@Controller('professional')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Get('settings')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard)
  getSettings(@Req() req) {
    return this.professionalService.getSettings(req.user.id as string);
  }

  @Get('schedule')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard)
  getDailySchedule(@Req() req, @Query('date') date: string) {
    return this.professionalService.getDailySchedule(
      req.user.id as string,
      date,
    );
  }

  @Patch('settings')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard)
  updateSettings(@Req() req, @Body() dto: UpdateProfessionalSettingsDto) {
    return this.professionalService.updateSettings(req.user.id as string, dto);
  }
}
