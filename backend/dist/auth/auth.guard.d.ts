import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '../supabase/service/SupabaseService';
import { UsersService } from '../users/service/users.service';
export declare class AuthGuard implements CanActivate {
    private supabaseService;
    private usersService;
    constructor(supabaseService: SupabaseService, usersService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
