import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.usersService.findById(user.userId);
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /** ต้องอยู่ก่อน route ทั่วไปที่อาจชน — ใช้ :id หลัง list */
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findAdminDetail(id);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.usersService.updateStatus(id, dto);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  adminUpdate(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.usersService.adminUpdate(id, dto, user.role);
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Delete(':id')
  adminDelete(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Param('id') id: string,
  ) {
    return this.usersService.adminDelete(id, user.role);
  }
}
