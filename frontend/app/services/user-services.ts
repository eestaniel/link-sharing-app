export const validateAccessToken = async (accessToken: string) => {
  const res = await fetch('http://localhost:3000/api/auth/validate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const data = await res.json();

  if (data.error) {
    return {error: data.error};
  }

  return data;
}

export const getData = async (accessToken: string) => {
  const res = await fetch('http://localhost:3000/api/users/get-preview', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const {links, profile, error} = await res.json();

  console.log('profile', profile)

  if (error) {
    return {error: error};
  }
  return {links: links, profile: profile};
}

export const getProfile = async (accessToken: string) => {
  const res = await fetch('http://localhost:3000/api/users/get-profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const {profile, error} = await res.json();

  if (error) {
    return {error: error};
  }
  return {profile: profile};
}


export const getUserLinks = async (accessToken: string) => {
  const res = await fetch('http://localhost:3000/api/users/get-links', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  const data = await res.json();

  if (data.error) {
    return {error: data.error};
  }

  return data;
}