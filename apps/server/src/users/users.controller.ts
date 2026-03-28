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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { RolesGuard } from '../auth/guards/roles-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRoleEnum } from '../auth/enums/user-role-enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(EmailVerifiedGuard)
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
  listProfessionals() {
    return this.usersService.findAllProfessionals();
  }

  @Get('patients')
  @UseGuards(EmailVerifiedGuard)
  listPatients() {
    return this.usersService.findAllPatients();
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles(UserRoleEnum.ADMIN)
  verifyUser(@Param('id') id: string, @Body() dto: VerifyUserDto) {
    return this.usersService.verifyUser(id, dto.emailVerified);
  }

  @Patch(':id')
  @UseGuards(EmailVerifiedGuard)
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Get(':id')
  @UseGuards(EmailVerifiedGuard)
  getUserbyId(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
