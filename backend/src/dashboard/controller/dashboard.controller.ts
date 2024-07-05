import { Controller, Get, UseGuards, Req, Post } from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';
import {AuthGuard} from '../../auth/auth.guard'



@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}
  @Get()
  getDashboard(@Req() req) {
    const user = req.user;
    return {
      message: `Welcome to your dashboard, ${user.email}!`,
      user: user
    };
  }

  @Post('links')
  @UseGuards(AuthGuard)
  verifyAccess(@Req() req) {

    return this.dashboardService.getLink();
  }

}