import { Module } from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';
import { DashboardController } from '../controller/dashboard.controller';
import {AuthGuard} from "../../auth/auth.guard";
import {SupabaseService} from "../../supabase/service/SupabaseService";
import { UsersService } from '../../users/service/users.service'
import {AuthService} from "../../auth/service/auth.service"

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, AuthGuard, AuthService, SupabaseService, UsersService],
})
export class DashboardModule {}
