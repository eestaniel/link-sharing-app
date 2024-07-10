import {
  Body,
  Controller, Get,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {UsersService} from "../service/users.service";
import {AuthGuard} from "../../auth/auth.guard"
import {Request} from 'express'
import {FileInterceptor} from "@nestjs/platform-express"
import {UserCacheDto} from "../dtos/user-dtos"
import {CACHE_MANAGER} from "@nestjs/cache-manager"
import {Cache} from "cache-manager"

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

  @Get('get-preview')
  async getPreview(@Req() req: Request): Promise<any> {
    const userCache: UserCacheDto = await this.cacheManager.get<UserCacheDto>(req.body.user_id);

    if (!userCache) {

      // fetch user links and profile from database
      const {links} = await this.usersService.getLinks(req.body.user_id);
      const {profile} = await this.usersService.getProfile(req.body.user_id);

      // save user links and profile to cache
      await this.cacheManager.set(req.body.user_id, {user_links: links, user_profile: profile});

      console.log('returning user links and profile from database')

      return {links, profile};
    }

    const links = userCache.user_links;
    const profile = userCache.user_profile;
    return {links, profile};
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
  async saveProfile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() body: {
      first_name: string,
      last_name: string,
      email: string,
      url: string
    }
  ) {
    return this.usersService.saveProfile(file, body, req)
  }


}