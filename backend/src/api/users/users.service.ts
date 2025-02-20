import {Request} from "express"
import supabase from "../../config/supabaseClient"

const getProfileWithLinks = async (req: Request) => {

  const user_id = req?.user?.sub || req?.user?.id

  // Get user profile
  const {data: user_profile, error: profile_error} = await supabase
    .from('profile')
    .select()
    .eq('id', user_id)

  if (profile_error) {

    throw new Error(`Error fetching user profile: ${profile_error.message}, req: ${req}`)
  }

  // append email to user_profile
  user_profile[0].email = req.user.email

  // Get user links
  const {data: user_links, error: links_error} = await supabase
    .from('links')
    .select()
    .eq('user_id', user_id)

  if (links_error) {

    throw new Error(`Error fetching user links: ${links_error.message}`)
  }

  // check if user_id has a picture
  const { data: imageData, error:imageError } = await supabase
    .storage
    .from('pictures')
    .list(`public/${user_id}/`, {
      limit: 1,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    })

  if (imageError) {
    throw new Error(`Error fetching user image: ${imageError.message}`)
  }

  // get url
  if (imageData?.length > 0) {
    const { data: imageDataUrl} = await supabase
      .storage
      .from('pictures')
      .createSignedUrl(`public/${user_id}/${imageData[0].name}`, 3600, {
        transform: {
          width: 193,
          height: 193,
        }
      })

    if (imageDataUrl) {
      user_profile[0].url = imageDataUrl.signedUrl
    }

  }

  // create a response object
  return {
    profile: user_profile[0],
    links: user_links
  }
}

const updateProfile = async (req: Request) => {
  // Get user_id from the request
  const user_id = req?.user?.sub || req?.user?.id

  // Get user profile details from supabase
  const {data: sb_user, error: sb_error} = await supabase
    .from('profile')
    .select('first_name, last_name')
    .eq('id', user_id)
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


  // Update only if necessary
  if (Object.keys(updateData).length > 0) {

    const {error: updateError} = await supabase
      .from('profile')
      .update(updateData)
      .eq('id', user_id);

    if (updateError) {
      throw new Error(updateError.message);
    }
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


  // make sure req.file is png or jpeg or jpg and max size 5MB
  if (req.file) {
    // validate file extension
    const validExtensions = ['image/png', 'image/jpeg', 'image/jpg']
    if (!validExtensions.includes(req.file.mimetype)) {
      throw new Error('Invalid file type')
    }
    // validate dimension
    if (req.file.size > 5 * 1024 * 1024) {
      throw new Error('File size too large')
    }
    // get the file extension and create a new file name
    // get last .* if multiple dots

    const fileExtension = req.file.originalname.split('.').pop()
    const newFileName = `avatar1.${fileExtension}`

    // upload to supabase
    const {error: fileError } = await supabase
      .storage
      .from('pictures')
      .upload(`public/${user_id}/${newFileName}`, req.file.buffer, {
        cacheControl: '3600',
        contentType: req.file.mimetype,
        upsert: true
      })

    if (fileError) {
      throw new Error(fileError.message)
    }
  }


  return {
    message: 'Profile updated',
    updatedFields: updateData,
    updatedEmail: updateEmail
  };
}


const upsertLinks = async (req: Request) => {
  const user_id = req?.user?.sub || req?.user?.id
  const linksArray = JSON.parse(req.body.links)


  // delete all links where user_id is equal to the current user_id
  const {error} = await supabase
    .from('links')
    .delete()
    .eq('user_id', user_id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  const {data: upsertData, error: upsertError} = await supabase
    .from('links')
    .upsert(
      linksArray.map((link: any) => ({
        user_id: user_id,
        id: link.id,
        platform: link.platform,
        url: link.url
      }))
    )
    .select()

  if (upsertError) {
    throw new Error(upsertError.message)
  }


  return {message: 'Links saved', upsertData: upsertData}
}

export default {
  getProfileWithLinks,
  updateProfile,
  upsertLinks
}