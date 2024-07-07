import {Controller, Get, Post, Body, UseGuards} from '@nestjs/common';
import {UsersService} from "../service/users.service";
import {CreateUserDto} from "../dtos/CreateUserDto";
import {AuthGuard} from "../../auth/auth.guard"


@Controller('users')
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

  // get all users
  @Get()
  async findAllUsers(): Promise<string> {
    return this.usersService.findAllUsers();
  }

  @Post('findOne')
  async findOne(@Body() body: { id: string }): Promise<string> {
    return this.usersService.findOne(body.id);
  }

  // Get links for a user by user ID (POST)
  @Post('get-links')
  async getLinks(@Body() body: { user_id: string }): Promise<string> {
    return this.usersService.getLinks(body.user_id);
  }

  @Post('save-links')
  async saveLinks(@Body() body: { accessToken: string, links: { id: string, platform: string, url: string }[] }): Promise<string> {
    return this.usersService.saveLinks(body.accessToken, body.links);
  }
}