import redisClient from "../config/redisClient";

interface redisSignInProps {
  id: string;
  email: string;
  token: string;
}

export const setUserRedisSignIn = ({id, email, token}: redisSignInProps) => {

  const userData = {
    email: email,
    token: token
  }

  redisClient.setEx(id, 86400, JSON.stringify(userData));

}

export const clearUserRedis = (id: string) => {
  console.log('deleting user session from Redis', id)
  redisClient.del(id);
}