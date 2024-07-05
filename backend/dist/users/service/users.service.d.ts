import { SupabaseService } from "../../supabase/service/SupabaseService";
export declare class UsersService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    createUserEntry(id: string, email: string): Promise<string>;
    findOrCreateUser(id: string, email: string): Promise<string>;
    findAllUsers(): Promise<string>;
    findOne(id: string): Promise<string>;
}
