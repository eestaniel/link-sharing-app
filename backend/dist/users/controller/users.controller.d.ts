import { UsersService } from "../service/users.service";
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    createUserEntry(id: string, email: string): Promise<string>;
    findOrCreateUser(id: string, email: string): Promise<string>;
    findAllUsers(): Promise<string>;
    findOne(body: {
        id: string;
    }): Promise<string>;
}
