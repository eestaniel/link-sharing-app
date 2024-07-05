import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '../supabase/service/SupabaseService';
import { UsersService } from '../users/service/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
      private supabaseService: SupabaseService,
      private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body.sessionId

    if (!token) {
      return false;
    }

    try {
      const { data: { user }, error } = await this.supabaseService
          .getClient()
          .auth
          .getUser(token);

      if (error) throw error;

      return true;
    } catch (error) {
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}