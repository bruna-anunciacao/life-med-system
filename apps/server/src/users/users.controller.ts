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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { ResourceOwnershipGuard } from './guards/resource-ownership.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { QuestionnaireCompletionGuard } from '../questionnaire/questionnaire-completion.guard';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@UseGuards(QuestionnaireCompletionGuard)
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

  @Patch(':id')
  @UseGuards(EmailVerifiedGuard, ResourceOwnershipGuard)
  @ApiOperation({ summary: 'Atualizar dados de um usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente o próprio usuário ou ADMIN pode editar.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Get(':id')
  @UseGuards(EmailVerifiedGuard, ResourceOwnershipGuard)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiParam({ name: 'id', description: 'ID do usuário (UUID)' })
  @ApiResponse({ status: 200, description: 'Dados do usuário.' })
  @ApiResponse({ status: 401, description: 'Não autenticado ou email não verificado.' })
  @ApiResponse({ status: 403, description: 'Acesso negado — somente o próprio usuário ou ADMIN pode visualizar.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  getUserbyId(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
