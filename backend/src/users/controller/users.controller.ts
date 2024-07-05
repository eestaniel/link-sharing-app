import {Controller, Get, Post, Body} from '@nestjs/common';
import {UsersService} from "../service/users.service";
import {CreateUserDto} from "../dtos/CreateUserDto";

@Controller('users')
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
}