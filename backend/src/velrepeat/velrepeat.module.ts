import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { VelRepeatService } from './velrepeat.service';
import { VelRepeatController } from './velrepeat.controller';
import { VelRepeatCronService } from './velrepeat-cron.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [VelRepeatController],
  providers: [VelRepeatService, VelRepeatCronService],
  exports: [VelRepeatService],
})
export class VelRepeatModule {}
