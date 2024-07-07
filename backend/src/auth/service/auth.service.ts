import {Injectable} from '@nestjs/common';
import {SupabaseService} from '../../supabase/service/SupabaseService';
import {UsersService} from '../../users/service/users.service';


@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private usersService: UsersService
  ) {
  }


  async validateUser(accessToken: string) {

    const {data: {user}} = await this.supabaseService
                                    .getClient()
                                    .auth.getUser(accessToken);
    return user
  }


  async signUp(email: string, password: string) {
    const {data, error} = await this.supabaseService
                                    .getClient()
                                    .auth
                                    .signUp({email, password});

    if (error) throw error;

    // Create user in your custom users table
    await this.usersService.createUserEntry(data.user.id, email);

    return data;
  }


  async signIn(email: string, password: string) {
    const {data, error} = await this.supabaseService
                                    .getClient()
                                    .auth
                                    .signInWithPassword({email, password});


    if (error) return JSON.stringify({error: "Invalid email or password"});
    // Return only the session token and refresh token to create new session
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    }

  }


  async signOut(token: string) {
    const {error} = await this.supabaseService
                              .getClient()
                              .auth
                              .signOut();

    if (error) throw error;

    return {message: 'Signed out successfully'};
  }
}