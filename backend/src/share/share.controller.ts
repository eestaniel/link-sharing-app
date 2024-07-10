import {Controller, Inject, Post, Body} from '@nestjs/common';
import { ShareService } from './share.service';
import {CACHE_MANAGER} from "@nestjs/cache-manager"
import {Cache} from "cache-manager"


@Controller('/api/share')
export class ShareController {
  constructor(private readonly shareService: ShareService,
              @Inject(CACHE_MANAGER) private cacheManager: Cache) {}


  @Post('get-share')
  async getShare(@Body() id: object): Promise<any> {

    return this.shareService.getShare(id);
  }


}
