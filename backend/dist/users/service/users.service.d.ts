import { SupabaseService } from "../../supabase/service/SupabaseService";
interface Link {
    id: string;
    platform: string;
    url: string;
}
interface UserLinkResponse {
    links: Link[];
    error?: string;
}
export declare class UsersService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    createUserEntry(id: string, email: string): Promise<string>;
    findOrCreateUser(id: string, email: string): Promise<string>;
    getLinks(accessToken: string): Promise<UserLinkResponse>;
    saveLinks(accessToken: string, links: {
        platform: string;
        url: string;
    }[]): Promise<string>;
}
export {};
