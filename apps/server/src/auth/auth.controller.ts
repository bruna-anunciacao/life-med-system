import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register-dto';
import { RegisterProfessionalDto } from './dto/register-profissional-dto';
import { RegisterAdminDto } from './dto/register-admin-dto';
import { RegisterManagerDto } from './dto/register-manager.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Autenticar usuário', description: 'Retorna o JWT de acesso para o usuário autenticado.' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso. Retorna o access_token JWT.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Cadastrar paciente', description: 'Cria uma conta de paciente e envia e-mail de verificação.' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Paciente cadastrado. E-mail de verificação enviado.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('register/professional')
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @ApiOperation({
    summary: 'Cadastrar profissional de saúde',
    description:
      'Cria uma conta de profissional pendente de aprovação pelo admin.',
  })
  @ApiBody({ type: RegisterProfessionalDto })
  @ApiResponse({
    status: 201,
    description: 'Profissional cadastrado. Aguardando aprovação do administrador.',
  })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async registerProfessional(@Body() dto: RegisterProfessionalDto) {
    return this.authService.registerProfessional(dto);
  }

  @Post('register/admin')
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @ApiOperation({
    summary: 'Cadastrar administrador', 
    description: 'Cria uma conta com perfil de administrador do sistema.',
  })
  @ApiBody({ type: RegisterAdminDto })
  @ApiResponse({
    status: 201,
    description: 'Administrador cadastrado com sucesso.',
  })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async registerAdmin(@Body() dto: RegisterAdminDto) {
    return this.authService.registerAdmin(dto);
  }

  @Post('register/manager')
  @Throttle({ short: { ttl: 60000, limit: 5 } })
  @ApiOperation({ summary: 'Cadastrar gestor', description: 'Cria uma conta com perfil de gestor do sistema.' })
  @ApiBody({ type: RegisterManagerDto })
  @ApiResponse({ status: 201, description: 'Gestor cadastrado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já cadastrado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  async registerManager(@Body() dto: RegisterManagerDto) {
    return this.authService.registerManager(dto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Solicitar redefinição de senha', description: 'Envia um e-mail com link/token para redefinição de senha.' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'E-mail de redefinição enviado (se o endereço estiver cadastrado).' })
  @ApiResponse({ status: 400, description: 'E-mail inválido.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Redefinir senha', description: 'Redefine a senha do usuário usando o token recebido por e-mail.' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 201, description: 'Senha redefinida com sucesso.' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado / senha não atende os requisitos.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar e-mail por token', description: 'Confirma o e-mail do usuário a partir do token enviado no link de verificação.' })
  @ApiQuery({ name: 'token', required: true, description: 'Token de verificação de e-mail' })
  @ApiResponse({ status: 200, description: 'E-mail verificado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Token inválido ou expirado.' })
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { ttl: 60000, limit: 3 } })
  @ApiOperation({ summary: 'Reenviar e-mail de verificação', description: 'Reenvia o link de verificação para o e-mail informado.' })
  @ApiBody({ type: ResendVerificationDto })
  @ApiResponse({ status: 200, description: 'E-mail de verificação reenviado.' })
  @ApiResponse({ status: 400, description: 'E-mail inválido.' })
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationEmail(dto.email);
  }
}
