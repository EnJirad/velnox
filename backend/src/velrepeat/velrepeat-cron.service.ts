import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { VelRepeatService } from './velrepeat.service';

/**
 * Runs the VelRepeat auto-order engine once a day, per
 * docs/01_Project_Overview.md section 4.2 ("ระบบตรวจสอบรอบส่ง →
 * สร้าง Order อัตโนมัติ"). Kept separate from VelRepeatService so the
 * business logic stays framework-agnostic and unit-testable without
 * the scheduler.
 */
@Injectable()
export class VelRepeatCronService {
  private readonly logger = new Logger(VelRepeatCronService.name);

  constructor(private readonly velRepeatService: VelRepeatService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleDueSubscriptions() {
    this.logger.log('Running VelRepeat due-subscription sweep...');
    await this.velRepeatService.processDueSubscriptions();
  }
}
