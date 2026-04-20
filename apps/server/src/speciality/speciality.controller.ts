import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SpecialityService } from './speciality.service';
import { CreateSpecialityDto } from './dto/create-speciality.dto';
import { UpdateSpecialityDto } from './dto/update-speciality.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-auth.guard';

@ApiTags('specialitiy')
@Controller('speciality')
export class SpecialityController {
  constructor(private readonly specialityService: SpecialityService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar especialidade' })
  @ApiResponse({ status: 201, description: 'Especialidade criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Especialidade já existe' })
  create(@Body() createSpecialityDto: CreateSpecialityDto) {
    return this.specialityService.create(createSpecialityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar especialidades' })
  @ApiResponse({
    status: 200,
    description: 'Especialidades listadas com sucesso',
  })
  findAll() {
    return this.specialityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar especialidade por ID' })
  @ApiResponse({
    status: 200,
    description: 'Especialidade encontrada com sucesso',
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.specialityService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar especialidade' })
  @ApiResponse({
    status: 200,
    description: 'Especialidade atualizada com sucesso',
  })
  @ApiResponse({ status: 400, description: 'ID inválido' })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSpecialityDto: UpdateSpecialityDto,
  ) {
    return this.specialityService.update(id, updateSpecialityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar especialidade' })
  @ApiResponse({
    status: 200,
    description: 'Especialidade deletada com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Especialidade não encontrada' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.specialityService.remove(id);
  }
}
