import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {AuthService} from './service/auth.service';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {
  }


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      const user = await this.authService.validateUser(token);
      if (!user.id) {
        return false;
      }


      request.body.user_id = user.id;
      request.user_id = user.id;

      return true;
    } catch (error) {
      return false;
    }
  }
}