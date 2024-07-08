import { Module } from '@nestjs/common';
import { UsersController } from '../controller/users.controller';
import { UsersService } from '../service/users.service';
import {SupabaseService} from "../../supabase/service/SupabaseService";
import {AuthGuard} from "../../auth/auth.guard"
import {AuthService} from "../../auth/service/auth.service"

@Module({
  controllers: [UsersController],
  providers: [UsersService, SupabaseService, AuthGuard, AuthService],
  exports: [UsersService],
})
export class UsersModule {}