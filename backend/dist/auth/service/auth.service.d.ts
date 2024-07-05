import { SupabaseService } from '../../supabase/service/SupabaseService';
import { UsersService } from '../../users/service/users.service';
export declare class AuthService {
    private supabaseService;
    private usersService;
    constructor(supabaseService: SupabaseService, usersService: UsersService);
    signUp(email: string, password: string): Promise<{
        user: import("@supabase/auth-js").User | null;
        session: import("@supabase/auth-js").Session | null;
    } | {
        user: null;
        session: null;
    }>;
    signIn(email: string, password: string): Promise<string | {
        sessionId: string;
    }>;
    signOut(token: string): Promise<{
        message: string;
    }>;
}
