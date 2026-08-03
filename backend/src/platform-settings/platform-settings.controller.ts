import { Body, Controller, Get, Patch } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { UpdatePlatformSettingsDto } from './dto/update-platform-settings.dto';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('platform-settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get()
  get() {
    return this.platformSettingsService.get();
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch()
  update(@Body() dto: UpdatePlatformSettingsDto) {
    return this.platformSettingsService.update(dto);
  }
}