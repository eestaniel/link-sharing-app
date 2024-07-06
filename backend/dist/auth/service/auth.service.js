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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const SupabaseService_1 = require("../../supabase/service/SupabaseService");
const users_service_1 = require("../../users/service/users.service");
let AuthService = class AuthService {
    constructor(supabaseService, usersService) {
        this.supabaseService = supabaseService;
        this.usersService = usersService;
    }
    async signUp(email, password) {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth
            .signUp({ email, password });
        if (error)
            throw error;
        await this.usersService.createUserEntry(data.user.id, email);
        return data;
    }
    async signIn(email, password) {
        const { data, error } = await this.supabaseService
            .getClient()
            .auth
            .signInWithPassword({ email, password });
        if (error)
            return JSON.stringify({ error: "Invalid email or password" });
        return {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token
        };
    }
    async signOut(token) {
        const { error } = await this.supabaseService
            .getClient()
            .auth
            .signOut();
        if (error)
            throw error;
        return { message: 'Signed out successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [SupabaseService_1.SupabaseService,
        users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map