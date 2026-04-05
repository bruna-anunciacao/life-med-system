import {
  Body,
  Controller,
  Patch,
  Get,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProfessionalService } from './professional.service';
import { UpdateProfessionalSettingsDto } from './dto/update-setting.dto';
import { ProfessionalRoleGuard } from './guards/professional-role.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';

@ApiTags('Professional')
@ApiBearerAuth('access-token')
@Controller('professional')
export class ProfessionalController {
  constructor(private readonly professionalService: ProfessionalService) {}

  @Get('settings')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({ summary: 'Obter configurações do profissional autenticado', description: 'Retorna modalidade, disponibilidade, preço e formas de pagamento.' })
  @ApiResponse({ status: 200, description: 'Configurações do profissional.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente PROFESSIONAL.' })
  getSettings(@Req() req) {
    return this.professionalService.getSettings(req.user.id as string);
  }

  @Get('schedule')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({ summary: 'Obter agenda diária do profissional', description: 'Retorna os agendamentos do dia informado para o profissional autenticado.' })
  @ApiQuery({ name: 'date', required: true, example: '2024-06-15', description: 'Data no formato YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos do dia.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente PROFESSIONAL.' })
  getDailySchedule(@Req() req, @Query('date') date: string) {
    return this.professionalService.getDailySchedule(
      req.user.id as string,
      date,
    );
  }

  @Patch('settings')
  @UseGuards(AuthGuard('jwt'), ProfessionalRoleGuard, EmailVerifiedGuard)
  @ApiOperation({ summary: 'Atualizar configurações do profissional', description: 'Atualiza modalidade, endereço, disponibilidade, preço e formas de pagamento.' })
  @ApiBody({ type: UpdateProfessionalSettingsDto })
  @ApiResponse({ status: 200, description: 'Configurações atualizadas com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente PROFESSIONAL.' })
  updateSettings(@Req() req, @Body() dto: UpdateProfessionalSettingsDto) {
    return this.professionalService.updateSettings(req.user.id as string, dto);
  }
}
