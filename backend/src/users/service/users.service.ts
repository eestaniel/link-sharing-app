import {Inject, Injectable} from '@nestjs/common';
import {SupabaseService} from "../../supabase/service/SupabaseService";
import {CACHE_MANAGER} from "@nestjs/cache-manager"
import {Cache} from "cache-manager"
import {UserCacheDto} from "../dtos/user-dtos"


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

  constructor(private readonly supabaseService: SupabaseService,
              @Inject(CACHE_MANAGER) private cacheManager: Cache) {
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
  async getLinks(user_id: string): Promise<any> {

    // Retrieve links associated with the user ID

    const {data, error} = await this.supabaseService.getClient()
                                    .from('user_links')
                                    .select('*')
                                    .eq('user_id', user_id);

    if (error) {
      return JSON.stringify({error: error.message});
    }
    const newArray = data.map((link: any) => {
      return {
        id: link.id,
        platform: link.platform,
        url: link.url
      }
    })
    // get current user cache
    const userCache: UserCacheDto = await this.cacheManager.get<UserCacheDto>(user_id)

    // update current user cache with new links
    if (userCache) {
      userCache.user_links = newArray
      await this.cacheManager.set(user_id, userCache);
    } else {
      await this.cacheManager.set(user_id, {
        refresh_token: '',
        user_links: newArray,
        user_profile: {
          first_name: '',
          last_name: '',
          email: '',
          url: ''
        }
      })
    }


    return {links: newArray};
  }


  async getProfile(user_id: string): Promise<any> {
    //get userID from supabase using accessToken

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

    const profile = {
      first_name: data[0].first_name,
      last_name: data[0].last_name,
      email: data[0].email,
      url: data[0].profile_picture_url
    }

    // save to cache
    const userCache: UserCacheDto = await this.cacheManager.get<UserCacheDto>(user_id)
    if (userCache) {
      userCache.user_profile = profile
      await this.cacheManager.set(user_id, userCache);
    } else {
      await this.cacheManager.set(user_id, {
        refresh_token: '',
        user_links: [],
        user_profile: profile
      })

    }
    return {profile: profile};
  }


  // save links
  async saveLinks(user_id: string, links: {
    id: string,
    platform: string,
    url: string
  }[]): Promise<any> {
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
                              .upsert(links.map(link => ({
                                ...link,
                                user_id
                              })));

    if (error) {
      return JSON.stringify({error: error.message});
    }

    // update cache with new links
    const userCache: UserCacheDto = await this.cacheManager.get<UserCacheDto>(user_id)
    if (userCache) {
      userCache.user_links = links
      await this.cacheManager.set(user_id, userCache);
    }


    return {message: "Links saved successfully"};
  }


  async saveProfile(
    file: Express.Multer.File,
    body: { first_name: string; last_name: string; email: string },
    req: any,
  ): Promise<string> {
    const profileToSave = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
    };

    if (file && file.buffer) {
      // get files from user folder
      const {data: files, error: filesError} = await this.supabaseService
                                                         .getClient()
                                                         .storage
                                                         .from('profile_pictures')
                                                         .list(`images/${req.user_id}`);


      // delete files from user folder. promise.wait all
      if (files && files.length > 0) {
        const deletePromises = files.map(async (file) => {
          await this.supabaseService
                    .getClient()
                    .storage
                    .from('profile_pictures')
            // @ts-ignore
                    .remove(`images/${req.user_id}/${file.name}`);
        });
        await Promise.all(deletePromises);
      }

      const {
        data: newStorage,
        error: newStorageError
      } = await this.supabaseService
                    .getClient()
                    .storage
                    .from('profile_pictures')
                    .upload(`images/${req.user_id}/${file.originalname}`, file.buffer, {
                      cacheControl: '3600',
                      upsert: true,
                      contentType: file.mimetype,
                    });

      if (newStorageError) {
        console.log('newStorageError: ', newStorageError.message)
        return JSON.stringify({error: newStorageError.message});
      }

      const {data: fileURLData} = this.supabaseService.getClient()
                                      .storage
                                      .from('profile_pictures')
                                      .getPublicUrl(newStorage.path)

      profileToSave['profile_picture_url'] = fileURLData.publicUrl;
    }

    const {data: updatedData, error: updatedError} = await this.supabaseService
                                                               .getClient()
                                                               .from('users')
                                                               .upsert(
                                                                 {
                                                                   id: req.user_id,
                                                                   ...profileToSave,
                                                                 },
                                                                 {
                                                                   onConflict: 'id',
                                                                 },
                                                               )
                                                               .select();

    if (updatedError) {
      console.log('updatedError: ', updatedError.message)
      return JSON.stringify({error: updatedError.message});
    }

    await this.updateCache(req.user_id, profileToSave);

    return JSON.stringify({message: 'Profile picture uploaded successfully'});
  }


  private getFileExtension(filename: string): string {
    return filename.split('.').pop();
  }


  private async updateCache(userId: string, profileToSave: any): Promise<string> {
    const userCache = await this.cacheManager.get<any>(userId);

    if (userCache?.user_profile.first_name) {
      userCache.user_profile.first_name = profileToSave.first_name;
      userCache.user_profile.last_name = profileToSave.last_name;
      userCache.user_profile.email = profileToSave.email;

      if (profileToSave['profile_picture_url']) {
        userCache.user_profile.url = profileToSave['profile_picture_url'];
      }

      await this.cacheManager.set(userId, userCache);
    } else {
      await this.cacheManager.set(userId, {
        refresh_token: '',
        user_links: [],
        user_profile: {
          first_name: profileToSave.first_name,
          last_name: profileToSave.last_name,
          email: profileToSave.email,
          url: profileToSave['profile_picture_url'],
        },
      });
    }


    return JSON.stringify({message: "Profile picture uploaded successfully"});
  }

}