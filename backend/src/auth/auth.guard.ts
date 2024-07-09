import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable
} from '@nestjs/common';
import {AuthService} from './service/auth.service';
import {CACHE_MANAGER} from "@nestjs/cache-manager"
import {Cache} from "cache-manager"

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService,
              @Inject(CACHE_MANAGER) private cacheManager: Cache) {
  }


  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      // unmap user_id from request
      return false;
    }




    try {
      // flag to check if token is in cache
      let updateCacheToken = false;
      // const tokenDetails
      const tokenDetails = await this.cacheManager.get<{
        access_token: string,
        user_id: string
      }>(`token:${token}`);

      if (tokenDetails) {
        if (tokenDetails.access_token === token) {
          request.body.user_id = tokenDetails.user_id
          request.user_id = tokenDetails.user_id
          return true;
          }
      }
      updateCacheToken = true;

      // if not in cache, validate token in supabase
      const user = await this.authService.validateUser(token);
      if (user === null || !user) {
        console.log('User not found')
        return false;
      }

      if (updateCacheToken) {
        await this.cacheManager.set(`token:${token}`, {
          access_token: token,
          user_id: user.id
        })
      }

      request.body.user_id = user.id;
      request.user_id = user.id;

      return true;
    } catch (error) {
      console.log('Error validating token')
      console.log('error: ', error)
      return false;
    }
  }
}