import {Inject, Injectable} from '@nestjs/common';
import {SupabaseService} from "../supabase/service/SupabaseService"
import {CACHE_MANAGER} from "@nestjs/cache-manager"
import {Cache} from "cache-manager"


@Injectable()
export class ShareService {
  constructor(private readonly supabaseService: SupabaseService,
              @Inject(CACHE_MANAGER) private cacheManager: Cache) {
  }


  async getShare(id: object): Promise<any> {
    let start = Date.now();
    const {id: uuid} = id as {id: string}

    console.log('uuid', uuid)

    // find user in supabase where user's share_uuid matches id
    // return user's share_uuid
    const {data: profileData, error: profileError} = await this.supabaseService.getClient()
                              .from('users')
                              .select('*')
                              .eq('share_uuid', uuid)

    if (profileError) {
      console.log('error', profileError)
      return {error: profileError}
    }

    if (profileData.length === 0) {
      return {error: 'No user found'}
    }


    // find user links in supabase where user's id matches id
    // return user's links
    const {data: linksData, error: linksError} = await this.supabaseService.getClient()
                              .from('user_links')
                              .select('*')
                              .eq('user_id', profileData[0].id)

    if (linksError) {
      console.log('error', linksError)
      return {error: linksError}
    }

    const links = linksData.map((link) => {
      return {id: link.id, platform: link.platform, url: link.url}
    })

    const profile = {
      first_name: profileData[0].first_name,
      last_name: profileData[0].last_name,
      email: profileData[0].email,
      url: profileData[0].profile_picture_url
    }

    console.log('time taken', Date.now() - start)
    return {
      profile: profile,
      links: links
    }
  }
}
