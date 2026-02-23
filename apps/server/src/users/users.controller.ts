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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Request() req) {
    return this.usersService.findOne(req.user.userId as string);
  }

  @Patch('me')
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
