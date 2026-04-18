import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags, ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { PatientsService } from 'src/patients/patients.service';
import { VerifyUserDto } from 'src/users/dto/verify-user.dto';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';


@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly patientsService: PatientsService,
  ) {}

  @Get('patients')
  @UseGuards(EmailVerifiedGuard)
  @ApiOperation({ summary: 'Listar todos os pacientes (Admin)', description: 'Somente administradores podem listar todos os pacientes do sistema.' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente ADMIN.' })
  listAllPatients() {
    return this.patientsService.listPatients();
  }

  @Get('professionals')
  @UseGuards(EmailVerifiedGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Listar todos os profissionais de saúde (Admin/Manager)', description: 'Administradores e gestores podem listar os profissionais cadastrados no sistema.' })
  @ApiResponse({ status: 200, description: 'Lista de profissionais.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente ADMIN ou MANAGER.' })
  listAllProfessionals() {
    return this.usersService.findAllProfessionals();
  }

  @Patch('verify/:id')
  @ApiOperation({ summary: 'Verificar e-mail de um usuário (Admin)', description: 'Somente administradores podem alterar o status de verificação de e-mail de um usuário.' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiBody({ type: VerifyUserDto })
  @ApiResponse({ status: 200, description: 'Status de verificação atualizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente ADMIN.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  verifyUser(@Param('id') id: string, @Body() dto: VerifyUserDto) {
    return this.usersService.verifyUser(id, dto.emailVerified);
  }

  @Patch('user/:id')
  @ApiOperation({ summary: 'Atualizar dados de um usuário por ID (Admin)', description: 'Somente administradores podem alterar os dados de qualquer usuário.' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente ADMIN.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  updateAnyUser(
    @Param('id') userIdToUpdate: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUserAsAdmin(userIdToUpdate, dto);
  }
}
