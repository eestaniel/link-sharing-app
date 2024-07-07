import {Injectable} from '@nestjs/common';
import {SupabaseService} from "../../supabase/service/SupabaseService";
import {CreateUserDto} from "../dtos/CreateUserDto";

@Injectable()
export class UsersService {

  constructor(private readonly supabaseService: SupabaseService) {
  }

  async createUserEntry(id: string, email: string): Promise<string> {
    const {data, error} = await this.supabaseService
        .getClient()
        .from('users')
        .insert([{id, email}]);

    if (error) {
      throw error;
    }
    return JSON.stringify(data);
  }

  async findOrCreateUser(id: string, email: string): Promise<string> {
    const {data, error} = await this.supabaseService
        .getClient()
        .from('users')
        .upsert([{id, email}]);

    if (error) {
      throw error;
    }
    return JSON.stringify(data);
  }




  // get all users
  // @ts-ignore
  async findAllUsers(): Promise<string> {
    const {data, error} = await this.supabaseService
        .getClient()
        .from('users')
        .select('*');

    if (error) {
      throw error;
    }

    return JSON.stringify(data);
  }

  // find one user
  async findOne(id: string): Promise<string> {
    const {data, error} = await this.supabaseService
        .getClient()
        .from('users')
        .select('*')
        .eq('id', id);

    if (error) {
      throw error;
    }

    return JSON.stringify(data);
  }

  // get links for a user
  async getLinks(user_id: string): Promise<string> {
/*     const {data, error} = await this.supabaseService
        .getClient()
        .from('links')
        .select('*')
        .eq('user_id', id);

    if (error) {
      throw error;
    } */

    return JSON.stringify({
      user_id: user_id,
      links: [{id: '1', platform: 'twitter', url: 'https://x.com'}]
    });
  }

  // save links
  async saveLinks(accessToken: string, links: { id: string, platform: string, url: string }[]): Promise<string> {
    //get userID from supabase using accessToken
    const {data: {user}} = await this.supabaseService.getClient().auth.getUser(accessToken)
    const user_id = user.id

    console.log('user_id', user_id)



    return JSON.stringify({
      user_id: user_id,
      links: links
    });
  }
}
