"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const SupabaseService_1 = require("../../supabase/service/SupabaseService");
let UsersService = class UsersService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async createUserEntry(id, email) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .insert([{ id, email }]);
        if (error) {
            throw error;
        }
        return JSON.stringify(data);
    }
    async findOrCreateUser(id, email) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .upsert([{ id, email }]);
        if (error) {
            throw error;
        }
        return JSON.stringify(data);
    }
    async getLinks(accessToken) {
        const { data: userResponse, error: userError } = await this.supabaseService.getClient().auth.getUser(accessToken);
        if (userError || !userResponse.user?.id) {
            return { links: [], error: "Invalid user" };
        }
        const userId = userResponse.user.id;
        const { data, error } = await this.supabaseService
            .getClient()
            .from('user_links')
            .select('*')
            .eq('user_id', userId);
        if (error) {
            throw new Error(error.message);
        }
        let newArray = data.map((link) => {
            return {
                id: link.id,
                platform: link.platform,
                url: link.url
            };
        });
        console.log('returning array:', newArray);
        return { links: newArray || [] };
    }
    async saveLinks(accessToken, links) {
        const { data: { user } } = await this.supabaseService.getClient().auth.getUser(accessToken);
        const user_id = user.id;
        if (!user_id) {
            return JSON.stringify({ error: "Invalid user" });
        }
        const { data: existingLinks, error: existingLinksError } = await this.supabaseService
            .getClient()
            .from('user_links')
            .select('*')
            .eq('user_id', user_id);
        if (existingLinksError) {
            return JSON.stringify({ error: existingLinksError.message });
        }
        const linksToDelete = existingLinks.filter(existingLink => !links.some(link => link.url === existingLink.url));
        console.log('linksToDelete:', linksToDelete);
        if (linksToDelete.length > 0) {
            const { error } = await this.supabaseService
                .getClient()
                .from('user_links')
                .delete()
                .in('id', linksToDelete.map(link => link.id));
            if (error) {
                return JSON.stringify({ error: error.message });
            }
        }
        const { error } = await this.supabaseService
            .getClient()
            .from('user_links')
            .upsert(links.map(link => ({ ...link, user_id })));
        if (error) {
            return JSON.stringify({ error: error.message });
        }
        console.log('returning links:', links);
        return JSON.stringify({
            links: links
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [SupabaseService_1.SupabaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map