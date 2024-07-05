import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthGuard } from '../auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signUp(@Body() signUpDto: { email: string; password: string }) {
    return this.authService.signUp(signUpDto.email, signUpDto.password);
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
  signOut(@Req() req) {
    return this.authService.signOut(req.token);
  }
}