import { Module } from '@nestjs/common';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import {CacheModule} from "@nestjs/cache-manager"
import {SupabaseService} from "../supabase/service/SupabaseService"


@Module({
  imports: [CacheModule.register({
    ttl: 3600000,
  })],
  controllers: [ShareController],
  providers: [ShareService, SupabaseService],
})
export class ShareModule {}
