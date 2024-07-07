import {Controller, Get, Post, Body, UseGuards} from '@nestjs/common';
import {UsersService} from "../service/users.service";
import {AuthGuard} from "../../auth/auth.guard"

interface Link {
  id: string;
  platform: string;
  url: string;
}


interface UserLinkResponse {
  links: Link[];
  error?: string;
}

@Controller('api/users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {
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
  async getLinks(@Body() body: { accessToken: string }): Promise<UserLinkResponse> {
    return this.usersService.getLinks(body.accessToken);
  }

  @Post('save-links')
  async saveLinks(@Body() body: { accessToken: string, links: { id: string, platform: string, url: string }[] }): Promise<string> {
    return this.usersService.saveLinks(body.accessToken, body.links);
  }

  @Post('save-profile')
  async saveProfile(@Body() body: { accessToken: string, profile: { first_name: string, last_name: string, email: string, profile_picture_url: string } }): Promise<string> {
    return this.usersService.saveProfile(body.accessToken, body.profile);
  }
}