import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthenticatedRequestUser } from '../auth/types/authenticated-request-user';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('platform-stats')
  getPlatformStats() {
    return this.analyticsService.getPlatformStats();
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('revenue-chart')
  getRevenueChart() {
    return this.analyticsService.getRevenueChart();
  }

  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('recent-orders')
  getRecentOrders() {
    return this.analyticsService.getRecentOrders();
  }

  /** แจ้งเตือนสำหรับ VelCenter (กระดิ่ง) */
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/notifications')
  getAdminNotifications(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.analyticsService.getAdminNotifications(user.userId);
  }

  /** VelMerchant dashboard overview */
  @Roles('MERCHANT')
  @Get('merchant/dashboard')
  getMerchantDashboard(@CurrentUser() user: AuthenticatedRequestUser) {
    return this.analyticsService.getMerchantDashboard(user.userId);
  }

  /** VelMerchant analytics with optional date range */
  @Roles('MERCHANT')
  @Get('merchant/sales')
  getMerchantSales(
    @CurrentUser() user: AuthenticatedRequestUser,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.analyticsService.getMerchantAnalytics(user.userId, from, to);
  }
}