import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors, Inject,
} from '@nestjs/common';
import {UsersService} from "../service/users.service";
import {AuthGuard} from "../../auth/auth.guard"
import {Request} from 'express'
import {FileInterceptor} from "@nestjs/platform-express"
import {UserCacheDto} from "../dtos/user-dtos"
import {CACHE_MANAGER} from "@nestjs/cache-manager"
import {Cache} from "cache-manager"


interface Link {
  id: string;
  platform: string;
  url: string;
}


interface UserLinkResponse {
  user_id: string;
}


@Controller('api/users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService,
              @Inject(CACHE_MANAGER) private cacheManager: Cache) {
  }


  // create CRUD operations for users
  @Post('create')
  async createUserEntry(@Body() id: string, email: string): Promise<string> {
    return this.usersService.createUserEntry(id, email);
  }


  @Post('find_or_create')
  async findOrCreateUser(@Body() id: string, email: string): Promise<string> {
    return this.usersService.findOrCreateUser(id, email);
  }


  // Get links for a user by user ID (POST)
  @Post('get-links')
  async getLinks(@Req() req: Request): Promise<any> {

    const userCache = await this.cacheManager.get<UserCacheDto>(req.body.user_id);

    if (!userCache || userCache.user_links.length === 0) {
      console.log('returning user links from database')
      return this.usersService.getLinks(req.body.user_id);
    }
    console.log('returning user links from cache')
    return {links: userCache.user_links};


  }


  @Post('get-profile')
  async getProfile(@Req() req: Request): Promise<any> {
    const userCache = await this.cacheManager.get<UserCacheDto>(req.body.user_id);
    if (!userCache || !userCache.user_profile.first_name && !userCache.user_profile.last_name && !userCache.user_profile.email){
      console.log('returning user profile from database')
      return this.usersService.getProfile(req.body.user_id);
    }

    console.log('returning user profile from cache')
    return {profile: userCache.user_profile};
  }


  // Functions to save Links and Profile data
  @Post('save-links')
  async saveLinks(
    @Body() body: {
      accessToken: string,
      links: { id: string, platform: string, url: string }[]
    },
    @Req() req: Request
  ): Promise<any> {

    return this.usersService.saveLinks(req.body.user_id, body.links);
  }


  @Post('save-profile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() body: {
      first_name: string,
      last_name: string,
      email: string,
      profile_picture_url: string
    }

    ) {
    return this.usersService.uploadFile(file, body, req)
  }


}