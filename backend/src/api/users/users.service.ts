import {Request} from "express"
import supabase from "../../config/supabaseClient"


const getProfileWithLinks = async (req: Request) => {

  const user_id = req.user.sub

  // Get user profile
  const {data: user_profile, error: profile_error} = await supabase
    .from('profile')
    .select()
    .eq('id', user_id)



  if (profile_error) {
    throw new Error(profile_error.message)
  }

  // append email to user_profile
  user_profile[0].email = req.user.email

  // Get user links
  const {data: user_links, error: links_error} = await supabase
    .from('links')
    .select()
    .eq('user_id', user_id)

  if (links_error) {
    throw new Error(links_error.message)


  }

  // create a response object
  return {
    user_profile: user_profile[0],
    user_links
  }
}

export default {
  getProfileWithLinks
}