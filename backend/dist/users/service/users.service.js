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
    async findAllUsers() {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .select('*');
        if (error) {
            throw error;
        }
        return JSON.stringify(data);
    }
    async findOne(id) {
        const { data, error } = await this.supabaseService
            .getClient()
            .from('users')
            .select('*')
            .eq('id', id);
        if (error) {
            throw error;
        }
        return JSON.stringify(data);
    }
    async getLinks(user_id) {
        return JSON.stringify({
            user_id: user_id,
            links: [{ id: '1', platform: 'twitter', url: 'https://x.com' }]
        });
    }
    async saveLinks(accessToken, links) {
        const { data: { user } } = await this.supabaseService.getClient().auth.getUser(accessToken);
        const user_id = user.id;
        console.log('user_id', user_id);
        return JSON.stringify({
            user_id: user_id,
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