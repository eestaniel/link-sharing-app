import { Request } from "express"
import { loginSignupPayload } from "../types"
import supabase from "../../config/supabaseClient"


const getProfileWithLinks = async (req: Request) => {
  console.log('req cookie', req.cookies.sb_session)
  const jwt = req.cookies.sb_session
  const { data: { user } } = await supabase.auth.getUser(jwt)
  console.log('user', user)
  return {data: 'data'}
}

export default {
  getProfileWithLinks
}