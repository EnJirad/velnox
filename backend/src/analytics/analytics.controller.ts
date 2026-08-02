import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('analytics')
@Roles('ADMIN', 'SUPER_ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('platform-stats')
  getPlatformStats() {
    return this.analyticsService.getPlatformStats();
  }

  @Get('revenue-chart')
  getRevenueChart() {
    return this.analyticsService.getRevenueChart();
  }

  @Get('recent-orders')
  getRecentOrders() {
    return this.analyticsService.getRecentOrders();
  }
}
