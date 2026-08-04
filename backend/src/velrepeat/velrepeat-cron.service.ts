import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VelRepeatService } from './velrepeat.service';

/**
 * รันทุกวันตี 1 — ส่งของจากเครดิตแพ็กที่ถึงกำหนด
 */
@Injectable()
export class VelRepeatCronService {
  private readonly logger = new Logger(VelRepeatCronService.name);

  constructor(private readonly velRepeatService: VelRepeatService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDuePacks() {
    this.logger.log('Running VelRepeat due-pack sweep...');
    await this.velRepeatService.processDuePacks();
  }
}