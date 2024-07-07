import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {AuthService} from './service/auth.service';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {
  }


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const {accessToken} = request.body;


    if (!accessToken) {
      return false;
    }

    try {
      const user = await this.authService.validateUser(accessToken);
      console.log(user)
      if (!user.id) {
        return false;
      }

      request.body.user = user;
      request.body.token = accessToken;
      return true;
    } catch (error) {
      return false;
    }
  }
}