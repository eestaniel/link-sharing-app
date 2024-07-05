import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/service/SupabaseService';
import { UsersService } from '../../users/service/users.service';

@Injectable()
export class AuthService {
  constructor(
      private supabaseService: SupabaseService,
      private usersService: UsersService
  ) {}

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabaseService
        .getClient()
        .auth
        .signUp({ email, password });

    if (error) throw error;

    // Create user in your custom users table
    await this.usersService.createUserEntry(data.user.id, email);

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabaseService
        .getClient()
        .auth
        .signInWithPassword({ email, password });



    if (error) return JSON.stringify({error: "Invalid email or password"});

    // Ensure user exists in your custom table
    await this.usersService.findOrCreateUser(data.user.id, email);

    // Return only the session token as a session identifier
    return { sessionId: data.session.access_token };
  }

  async signOut(token: string) {
    const { error } = await this.supabaseService
        .getClient()
        .auth
        .signOut();

    if (error) throw error;

    return { message: 'Signed out successfully' };
  }
}