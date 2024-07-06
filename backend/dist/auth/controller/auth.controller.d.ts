import { AuthService } from '../service/auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signUp(signUpDto: {
        email: string;
        password: string;
    }): Promise<{
        user: import("@supabase/auth-js").User | null;
        session: import("@supabase/auth-js").Session | null;
    } | {
        user: null;
        session: null;
    }>;
    signIn(signInDto: {
        email: string;
        password: string;
    }): Promise<string | {
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(req: any): any;
    signOut(req: any): Promise<{
        message: string;
    }>;
}
