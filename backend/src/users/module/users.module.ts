import { Module } from '@nestjs/common';
import { UsersController } from '../controller/users.controller';
import { UsersService } from '../service/users.service';
import {SupabaseService} from "../../supabase/service/SupabaseService";
import {AuthGuard} from "../../auth/auth.guard"
import {AuthService} from "../../auth/service/auth.service"
import {CacheModule} from "@nestjs/cache-manager"


@Module({
  imports: [CacheModule.register({
    ttl: 3600000,
  })],
  controllers: [UsersController],
  providers: [UsersService, AuthService, SupabaseService, AuthGuard],
  exports: [UsersService]
})
export class UsersModule {}