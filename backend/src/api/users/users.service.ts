import {Request} from "express"
import supabase from "../../config/supabaseClient"


const getProfileWithLinks = async (req: Request) => {

  const user_id = req.user.sub || req.user.id

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
    profile: user_profile[0],
    links: user_links
  }
}

const updateProfile = async (req: Request) => {
  // Get user_id from the request
  const user_id = req.user.sub || req.user.id

  // Get user profile details from supabase
  const {data: sb_user, error: sb_error} = await supabase
    .from('profile')
    .select('first_name, last_name')
    .eq('id', req.user.sub)
    .single()

  if (sb_error) {
    throw new Error(sb_error.message)
  }

  // Prepare an update object only for changed fields
  const updateData: Partial<{ first_name: string; last_name: string }> = {};

  // Check if first_name and last_name are different from the current values
  if (req.body.first_name && req.body.first_name !== sb_user.first_name) {
    updateData.first_name = req.body.first_name;
  }
  if (req.body.last_name && req.body.last_name !== sb_user.last_name) {
    updateData.last_name = req.body.last_name;
  }

  // If no updates are needed, return early
  if (Object.keys(updateData).length === 0) {
    return {message: 'No changes detected'};
  }

  // Update only if necessary
  const {error: updateError} = await supabase
    .from('profile')
    .update(updateData)
    .eq('id', user_id);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // check if req.body.email is different than req.user.email
  if (req.body.email !== req.user.email) {
    console.log('email is different')
  }

  // Check if email is different from the current value
  const updateEmail: Partial<{ email: string }> = {};
  if (req.body.email !== req.user.email) {
    updateEmail.email = req.body.email;
  }

  // Update email if necessary
  if (Object.keys(updateEmail).length > 0) {
    const {
      data: userEmail,
      error: errorEmail
    } = await supabase.auth.updateUser(updateEmail);

    if (errorEmail) {
      throw new Error(errorEmail.message);
    }

  }

  return {message: 'Profile updated', updatedFields: updateData, updatedEmail: updateEmail};
}

export default {
  getProfileWithLinks,
  updateProfile,
}