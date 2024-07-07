import {Injectable} from '@nestjs/common';
import {SupabaseService} from "../../supabase/service/SupabaseService";


interface Link {
  id: string;
  platform: string;
  url: string;
}


interface UserLinkResponse {
  links: Link[];
  error?: string;
}


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


  // Get links for a user using the access token
  async getLinks(accessToken: string): Promise<UserLinkResponse> {
    // Retrieve user from Supabase using accessToken
    const {data: userResponse, error: userError} = await this.supabaseService.getClient().auth.getUser(accessToken);

    if (userError || !userResponse.user?.id) {
      return {links: [], error: "Invalid user"};
    }

    const userId = userResponse.user.id;

    // Retrieve links associated with the user ID
    const {data, error} = await this.supabaseService
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
      }
    })

    // Map data fields directly since they already match the Link interface
    return {links: newArray || []};
  }


  // save links
  async saveLinks(accessToken: string, links: { platform: string, url: string }[]): Promise<string> {
    //get userID from supabase using accessToken
    const {data: {user}} = await this.supabaseService.getClient().auth.getUser(accessToken)
    const user_id = user.id

    if (!user_id) {
      return JSON.stringify({error: "Invalid user"});
    }

    /* 1. Fetch existing links for the user
     * 2. Determine Links to delete
     * 3. Delete missing links
     * 5. upsert incoming links */

    // fetch existing links for the user
    const {
      data: existingLinks,
      error: existingLinksError
    } = await this.supabaseService
                  .getClient()
                  .from('user_links')
                  .select('*')
                  .eq('user_id', user_id);

    if (existingLinksError) {
      return JSON.stringify({error: existingLinksError.message});
    }

    // Determine links to delete
    const linksToDelete = existingLinks.filter(existingLink => !links.some(link => link.url === existingLink.url));


    // delete missing links based on id
    if (linksToDelete.length > 0) {
      const {error} = await this.supabaseService
                            .getClient()
                            .from('user_links')
                            .delete()
                            .in('id', linksToDelete.map(link => link.id));

      if (error) {
        return JSON.stringify({error: error.message});
      }
    }
    // save links to the database
    const {error} = await this.supabaseService
                              .getClient()
                              .from('user_links')
                              .upsert(links.map(link => ({...link, user_id})));

    if (error) {
      return JSON.stringify({error: error.message});
    }


    return JSON.stringify({
      links: links
    });
  }

  async saveProfile(accessToken: string, profile: {
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string
  }): Promise<string> {
    //get userID from supabase using accessToken
    const {data: {user}} = await this.supabaseService.getClient().auth.getUser(accessToken)
    const user_id = user.id

    if (!user_id) {
      return JSON.stringify({error: "Invalid user"});
    }

    const {error} = await this.supabaseService
                              .getClient()
                              .from('users')
                              .upsert([{id: user_id, ...profile}]);

    if (error) {
      return JSON.stringify({error: error.message});
    }

    return JSON.stringify({
      profile: profile
    });
  }

  async getProfile(accessToken: string): Promise<string> {
    //get userID from supabase using accessToken
    const {data: {user}} = await this.supabaseService.getClient().auth.getUser(accessToken)
    const user_id = user.id

    if (!user_id) {
      return JSON.stringify({error: "Invalid user"});
    }

    const {data, error} = await this.supabaseService
                                    .getClient()
                                    .from('users')
                                    .select('*')
                                    .eq('id', user_id);

    if (error) {
      return JSON.stringify({error: error.message});
    }



    return JSON.stringify({
      profile: {
        first_name: data[0].first_name,
        last_name: data[0].last_name,
        email: data[0].email,
        profile_picture_url: data[0].profile_picture_url
      }
    });
  }
}