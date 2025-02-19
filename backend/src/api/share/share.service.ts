import {Request} from "express"
import supabase from "../../config/supabaseClient"


export const getPublicProfile = async (req: Request) => {
  const urlParams = req.params
  const id = urlParams.id

  // get profile
  const {data: profile, error: profile_error} = await supabase
    .from('profile')
    .select()
    .eq('share_uuid', id)
    .single()

  if (profile_error) {
    throw new Error(profile_error.message)
  }

  // append email from auth.users


  // get links
  const {data: links, error: links_error} = await supabase
    .from('links')
    .select()
    .eq('user_id', profile.id)

  if (links_error) {
    throw new Error(links_error.message)
  }


  // get picture
  const { data: imageData, error:imageError } = await supabase
    .storage
    .from('pictures')
    .list(`public/${profile.id}/`, {
      limit: 1,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })

  if (imageError) {
    throw new Error(imageError.message)
  }

  // get url
  if (imageData?.length > 0) {
    const { data: imageDataUrl} = await supabase
      .storage
      .from('pictures')
      .createSignedUrl(`public/${profile.id}/${imageData[0].name}`, 3600, {
        transform: {
          width: 193,
          height: 193,
        }
      })

    if (imageDataUrl) {
      profile.url = imageDataUrl.signedUrl
    }
  }



  return {message: 'getPublicProfile', profile, links}
}



export default {
  getPublicProfile
}