import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '../auth.guard';
import {Request} from 'express'




@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Default post method to validate user
  @Post('validate')
  @UseGuards(AuthGuard)
  async validate(@Req() req: Request) {

    return {message: 'User validated'};
  }

  @Post('create-account')
  createAccount(@Body() signUpDto: { email: string; password: string }) {
    return this.authService.createAccount(signUpDto.email, signUpDto.password);
  }

  @Post('signin')
  signIn(@Body() signInDto: { email: string; password: string }) {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  signOut(@Req() req) {
    return this.authService.signOut(req);
  }

  @Post('test')
  test(@Req() req) {
    return this.authService.test();
  }
}