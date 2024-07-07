import { UsersService } from "../service/users.service";
interface Link {
    id: string;
    platform: string;
    url: string;
}
interface UserLinkResponse {
    links: Link[];
    error?: string;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUserEntry(id: string, email: string): Promise<string>;
    findOrCreateUser(id: string, email: string): Promise<string>;
    getLinks(body: {
        accessToken: string;
    }): Promise<UserLinkResponse>;
    saveLinks(body: {
        accessToken: string;
        links: {
            id: string;
            platform: string;
            url: string;
        }[];
    }): Promise<string>;
}
export {};
