import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { ResourceOwnershipGuard } from '../users/guards/resource-ownership.guard';

@ApiTags('Addresses')
@UseGuards(JwtAuthGuard) 
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('cep/:cep')
  @ApiOperation({summary: 'Consultar endereço por CEP', description:'Busca informações de endereço usando a API ViaCEP.'})
  @ApiParam({name: 'cep', description: 'CEP com 8 dígitos'})
  @ApiResponse({status: 200, description: 'Endereço encontrado'})
  @ApiResponse({status: 400, description: 'CEP inválido'})
  @ApiResponse({status: 404, description: 'CEP não encontrado'})
  searchByCep(@Param('cep') cep: string) {
    return this.addressesService.searchByCep(cep);
  }

  @Post('user/:id')
  @UseGuards(EmailVerifiedGuard, ResourceOwnershipGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
  @ApiOperation({summary: 'Criar endereço do usuário'})
  @ApiParam({name: 'id', description: 'ID do usuário'})
  @ApiBody({ type: CreateAddressDto })
  @ApiResponse({status: 201, description: 'Endereço criado com sucesso'})
  @ApiResponse({status: 400, description: 'Dados inválidos ou usuário já possui endereço'})
  @ApiResponse({status: 401, description: 'Não autenticado'  })
  @ApiResponse({status: 403, description: 'Sem permissão para criar endereço este usuário'})
  @ApiResponse({status: 404, description: 'Usuário não encontrado'})
  create(@Param('id') userId: string, @Body() dto: CreateAddressDto) {
    return this.addressesService.create(userId, dto);
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(EmailVerifiedGuard, ResourceOwnershipGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({summary: 'Obter endereço do usuário'})
  @ApiParam({name: 'id', description: 'ID do usuário'})
  @ApiResponse({status: 200, description: 'Endereço encontrado'})
  @ApiResponse({status: 401, description: 'Não autenticado'})
  @ApiResponse({status: 403, description: 'Sem permissão para acessar este endereço'})
  @ApiResponse({status: 404, description: 'Endereço não encontrado'})
  findByUserId(@Param('id') userId: string) {
    return this.addressesService.findByUserId(userId);
  }

  @Put('user/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(EmailVerifiedGuard, ResourceOwnershipGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({summary: 'Atualizar endereço do usuário'})
  @ApiParam({name: 'id', description: 'ID do usuário'})
  @ApiBody({ type: UpdateAddressDto })
  @ApiResponse({status: 200, description: 'Endereço atualizado com sucesso'})
  @ApiResponse({status: 400, description: 'Dados inválidos'})
  @ApiResponse({status: 401, description: 'Não autenticado'})
  @ApiResponse({status: 403, description: 'Sem permissão para atualizar este endereço'})
  @ApiResponse({status: 404, description: 'Endereço não encontrado'})
  update(@Param('id') userId: string, @Body() dto: UpdateAddressDto) {
    return this.addressesService.update(userId, dto);
  }

  @Delete('user/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(EmailVerifiedGuard, ResourceOwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('access-token')
  @ApiOperation({summary: 'Deletar endereço do usuário'})
  @ApiParam({name: 'id', description: 'ID do usuário'})
  @ApiResponse({status: 204, description: 'Endereço removido com sucesso'})
  @ApiResponse({status: 401, description: 'Não autenticado'})
  @ApiResponse({status: 403, description: 'Sem permissão para deletar este endereço'})
  @ApiResponse({status: 404, description: 'Endereço não encontrado'})
  delete(@Param('id') userId: string) {
    return this.addressesService.delete(userId);
  }
}
