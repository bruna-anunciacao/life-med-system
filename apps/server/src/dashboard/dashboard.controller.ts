import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';
import { DashboardOverviewQueryDto } from './dto/dashboard-overview-query.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('access-token')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Indicadores agregados do sistema (Admin/Gestor)',
    description:
      'Retorna consultas, atendimentos, solicitações pendentes, triagens e demografia agregados. Requer role ADMIN ou MANAGER.',
  })
  @ApiResponse({ status: 200, description: 'Indicadores agregados do período.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({
    status: 403,
    description: 'Acesso negado — somente ADMIN ou MANAGER.',
  })
  getOverview(@Query() query: DashboardOverviewQueryDto) {
    return this.dashboardService.getOverview(query);
  }
}
