import supabase from '../../config/supabaseClient';
import {
  setUserRedisSignIn,
  clearUserRedis,
  getUserRefreshToken
} from "../../utils/redisUtils";
import {loginSignupPayload} from "../types"
import {Request} from "express";

const login = async ({email, password}: loginSignupPayload) => {


  const {data, error} = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    throw new Error(error.message);
  }




  // save user session to redis
  // setUserRedisSignIn({id: data.user.id, refresh_token: data.session?.refresh_token});
  return data;


}

const signup = async ({email, password}: loginSignupPayload) => {

  // Step 1: Create a new user in Supabase
  const {data, error}: {data: any, error: any} = await supabase.auth.signUp({
    email: email,
    password: password,
  })


  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error('User not created');
  }

  // Step 2: Insert profile into the 'profile' table
  const { error: profileError } = await supabase.from("profile").insert([
    { id: data.user.id, email: email},
  ]);

  if (profileError) throw profileError;


  // save user session to redis
  //setUserRedisSignIn({id: data.user.id, refresh_token: data.session?.refresh_token});

  return data

}

const signOut = async (req: Request) => {

  // sign out user
  const refresh_token = req.tokens?.refresh_token


  if (refresh_token === null) {
    throw new Error('User not signed in');
  }
  // @ts-ignore
  const { data, error: error1 } = await supabase.auth.refreshSession({ refresh_token })
  const { session, user } = data

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message);
  }


  return {success: 'User signed out'}


}

export default {
  login,
  signup,
  signOut
}