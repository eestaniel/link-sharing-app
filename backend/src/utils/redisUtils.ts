import redisClient from "../config/redisClient";


interface redisSignInProps {
  id: string;
  email?: string;
  access_token?: string;
  refresh_token?: string;
}

export const setUserRedisSignIn = ({id, refresh_token}: redisSignInProps) => {

  const userData = {
    refresh_token: refresh_token
  }

  redisClient.setEx(id, 86400, JSON.stringify(userData));
}


export const getUserRefreshToken = async (id: string) => {
  const data = await redisClient.get(id);
  const parsedData = JSON.parse(data as string);
  return parsedData.refresh_token
}

export const clearUserRedis = (id: string) => {
  console.log('deleting user session from Redis', id)
  redisClient.del(id);
}