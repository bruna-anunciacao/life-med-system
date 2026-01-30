import {
  Controller,
  Get,
  Body,
  Patch,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId as string);
  }

  @Patch('me')
  updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.userId as string, dto);
  }

  @Get('professionals')
  listProfessionals() {
    return this.usersService.findAllProfessionals();
  }

  @Get('patients')
  listPatients() {
    return this.usersService.findAllPatients();
  }

  @Patch(':id')
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
