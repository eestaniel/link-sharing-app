import { SupabaseService } from "../../supabase/service/SupabaseService";
export declare class UsersService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    createUserEntry(id: string, email: string): Promise<string>;
    findOrCreateUser(id: string, email: string): Promise<string>;
    findAllUsers(): Promise<string>;
    findOne(id: string): Promise<string>;
    getLinks(user_id: string): Promise<string>;
    saveLinks(accessToken: string, links: {
        id: string;
        platform: string;
        url: string;
    }[]): Promise<string>;
}
