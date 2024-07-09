import {Inject, Injectable} from '@nestjs/common';
import {SupabaseService} from '../../supabase/service/SupabaseService';
import {UsersService} from '../../users/service/users.service';
import {Cache} from 'cache-manager';
import {CACHE_MANAGER} from "@nestjs/cache-manager"

@Injectable()
export class AuthService {
  constructor(
    private supabaseService: SupabaseService,
    private usersService: UsersService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
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

    // store user_id, refresh_token in cache, parse as string,
    // {user_id: {
    //  refresh_token: 'refresh_token'
    //  }
    const user_id: string = data.user.id;
    const refresh_token: string = data.session.refresh_token;
    const userCache = await this.cacheManager.get(user_id);
    if (!userCache) {
      const newUserCache = {
        refresh_token: refresh_token,
        user_links: [],
        user_profile: {
          profile_picture_url: '',
          first_name: '',
          last_name: '',
          email: ''
        }
      }
      newUserCache.refresh_token = refresh_token;
      await this.cacheManager.set(user_id, newUserCache);
      // map user_id to access_token
      await this.cacheManager.set(`token:${data.session.access_token}`, { user_id: user_id, refresh_token: refresh_token, access_token: data.session.access_token });    }
    // Return only the session token and refresh token to the client to, so they can set session
    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    }

  }


  async signOut(req) {


    // clear cache where req.user_id is the key
    const userCache = await this.cacheManager.get(req.user_id);
    if (userCache) {
      console.log('clearing cache for user_id')
      await this.cacheManager.del(req.user_id);
    }
    // clear cache where token is the key
    const tokenCache = await this.cacheManager.get(`token:${req.headers.authorization?.split(' ')[1]}`);
    if (tokenCache) {
      console.log('clearing cache for token')
      await this.cacheManager.del(`token:${req.headers.authorization?.split(' ')[1]}`);
    }


    return {message: 'Signed out successfully'};
  }


  async test() {

  }
}