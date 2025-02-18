import supabase from '../../config/supabaseClient';
import {setUserRedisSignIn, clearUserRedis} from "../../utils/redisUtils";
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
  //setUserRedisSignIn({id: data.user.id, email, token: data.session.access_token});
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
    { id: data.user.id},
  ]);

  if (profileError) throw profileError;


  // save user session to redis
  //setUserRedisSignIn({id: data.user.id, email, token: data.session.access_token});

  return data

}

const signOut = async (req: Request) => {

  const {user, token} = req



  if (!user) {
    throw new Error('User not found')
  }

  // clear user session from redis
  clearUserRedis(user.sub)

  // sign out user from supabase
  // @ts-ignore
  const {error} = await supabase.auth.signOut(token);


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