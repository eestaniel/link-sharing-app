import { Module } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { SupabaseService } from '../../supabase/service/SupabaseService'
import { UsersService } from '../../users/service/users.service'
import { AuthGuard } from "../auth.guard"


@Module({
  controllers: [AuthController],
  providers: [AuthService, SupabaseService, UsersService, AuthGuard],

})
export class AuthModule {}
