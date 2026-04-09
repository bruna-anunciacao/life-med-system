import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

import { UserRole } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('me')
  @UseGuards(EmailVerifiedGuard)
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário autenticado.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId as string);
  }

  @Patch('me')
  @UseGuards(EmailVerifiedGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/profile-photos',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `user-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Atualizar perfil do usuário autenticado', description: 'Aceita multipart/form-data para envio de foto de perfil.' })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Perfil atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  updateProfile(
    @Request() req,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      dto.photoUrl = `/uploads/profile-photos/${file.filename}`;
    }

    return this.usersService.update(req.user.userId as string, dto);
  }

  @Get('professionals')
  @UseGuards(EmailVerifiedGuard)
  @ApiOperation({ summary: 'Listar todos os profissionais de saúde' })
  @ApiResponse({ status: 200, description: 'Lista de profissionais.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  listProfessionals() {
    return this.usersService.findAllProfessionals();
  }

  @Get('patients')
  @UseGuards(EmailVerifiedGuard)
  @ApiOperation({ summary: 'Listar todos os pacientes' })
  @ApiResponse({ status: 200, description: 'Lista de pacientes.' })
  @ApiResponse({ status: 401, description: 'Não autenticado.' })
  listPatients() {
    return this.usersService.findAllPatients();
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Verificar e-mail de um usuário (Admin)', description: 'Somente administradores podem alterar o status de verificação de e-mail de um usuário.' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiBody({ type: VerifyUserDto })
  @ApiResponse({ status: 200, description: 'Status de verificação atualizado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente ADMIN.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  verifyUser(@Param('id') id: string, @Body() dto: VerifyUserDto) {
    return this.usersService.verifyUser(id, dto.emailVerified);
  }

  @Patch(':id')
  @UseGuards(EmailVerifiedGuard)
  @ApiOperation({ summary: 'Atualizar dados de um usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Get(':id')
  @UseGuards(EmailVerifiedGuard)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados do usuário.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  getUserbyId(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
