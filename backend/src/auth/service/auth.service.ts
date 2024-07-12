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


  async createAccount(email: string, password: string) {
    const {data: newData, error: newError} = await this.supabaseService.getClient()
      .auth.signUp({
        email: email,
        password: password
      });
    if (newError) {
      return {error: newError.message};
    }

    // upsert user in users table
    const {data: dataProfile, error: dataProfileError} = await this.supabaseService.getClient()
      .from('users')
      .upsert({
        id: newData.user.id,
        email: email,
      })
      .select()

    if (dataProfileError) {
      return {error: dataProfileError.message};
    }



    return {message: 'Account created successfully', data:dataProfile[0]};
  }

  async signInAnon() {
    const {data, error} = await this.supabaseService.getClient()
      .auth.signInAnonymously()

    if (error) {
      return {error: error.message}
    }

    // create anon user in users table
    const {data: dataProfile, error: dataProfileError} = await this.supabaseService.getClient()
      .from('users')
      .upsert({
        id: data.user.id,
      })
      .select()

    if (dataProfileError) {
      return {error: dataProfileError.message}
    }


    return {message: 'Anon user created successfully', accessToken: data.session.access_token};
  }


  async signIn(email: string, password: string) {
    let start = new Date().getTime();

    const {data, error} = await this.supabaseService
                                    .getClient()
                                    .auth
                                    .signInWithPassword({email, password});


    if (error) return JSON.stringify({error: "Invalid email or password"});

    const user_id: string = data.user.id;

    // get user_Links, user_profile from cache
    const {
      data: dataLinks,
      error: dataLinksError
    } = await this.supabaseService.getClient()
                  .from('user_links')
                  .select('*')
                  .eq('user_id', user_id);

    if (dataLinksError) {
      return JSON.stringify({error: dataLinksError});
    }

    const newArray = dataLinks.map((link: any) => {
      return {
        id: link.id,
        platform: link.platform,
        url: link.url
      }
    })


    const {
      data: dataProfile,
      error: dataProfileError
    } = await this.supabaseService.getClient()
                  .from('users')
                  .select('*')
                  .eq('id', user_id);

    if (dataProfileError) {
      return JSON.stringify({error: dataProfileError});
    }

    const profile = {
      first_name: dataProfile[0].first_name,
      last_name: dataProfile[0].last_name,
      email: dataProfile[0].email,
      url: dataProfile[0].profile_picture_url,
      share_uuid: dataProfile[0].share_uuid
    }


    const refresh_token: string = data.session.refresh_token;
    const userCache = await this.cacheManager.get(user_id);
    if (!userCache) {
      const newUserCache = {
        refresh_token: refresh_token,
        user_links: newArray,
        user_profile: profile
      }
      newUserCache.refresh_token = refresh_token;
      await this.cacheManager.set(user_id, newUserCache);
      // map user_id to access_token
      await this.cacheManager.set(`token:${data.session.access_token}`, {
        user_id: user_id,
        refresh_token: refresh_token,
        access_token: data.session.access_token
      });
    }
    // Return only the session token and refresh token to the client to, so
    // they can set session


    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token
    }

  }


  async signOut(req) {


    // clear cache where req.user_id is the key
    const userCache = await this.cacheManager.get(req.user_id);
    if (userCache) {
      await this.cacheManager.del(req.user_id);
    }
    // clear cache where token is the key
    const tokenCache = await this.cacheManager.get(`token:${req.headers.authorization?.split(' ')[1]}`);
    if (tokenCache) {
      await this.cacheManager.del(`token:${req.headers.authorization?.split(' ')[1]}`);
    }


    return {message: 'Signed out successfully'};
  }


  async test() {

  }
}