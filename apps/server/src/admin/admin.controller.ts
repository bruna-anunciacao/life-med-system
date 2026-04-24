import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UsersService } from 'src/users/users.service';
import { VerifyUserDto } from 'src/users/dto/verify-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query-dto';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @ApiOperation({ summary: 'Listar usuários do sistema (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente ADMIN.' })
  listUsers(@Query() query: ListAdminUsersQueryDto) {
    return this.usersService.findAllUsers(query);
  }

  @Patch('verify/:id')
  @ApiOperation({ summary: 'Verificar e-mail de um usuário (Admin)' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiBody({ type: VerifyUserDto })
  @ApiResponse({
    status: 200,
    description: 'Status de verificação atualizado.',
  })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente ADMIN.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  verifyUser(@Param('id') id: string, @Body() dto: VerifyUserDto) {
    return this.usersService.verifyUser(id, dto.emailVerified);
  }

  @Patch('user/:id')
  @ApiOperation({ summary: 'Atualizar dados de um usuário por ID (Admin)' })
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
