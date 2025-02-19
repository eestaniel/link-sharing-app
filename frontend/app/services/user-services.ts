
const baseUrl = process.env.BASE_URL

export const validateAccessToken = async (sb_session: string) => {
  const res = await fetch(`${baseUrl}/api/v1/auth/validate`, {
    method: 'get',
    headers: {
      Cookie: `sb_session=${sb_session}`
    }

  });
  const data = await res.json();

  if (data.error) {
    return {error: data.error};
  }

  return true
}

export const getData = async (request: any) => {
  const res = await fetch(`${baseUrl}/api/v1/users/profile-with-links`, {
    method: 'GET',
    headers: {
      'Cookie': request.headers.get('Cookie')
    }
  });
  const {links, profile, error} = await res.json();

  const cookieHeader = res.headers.get('set-cookie');
  if (error) {
    return {error: error};
  }
  return {
    data: {links, profile},
    headers: cookieHeader ? {"Set-Cookie": cookieHeader} : {}
  };
}

export const getProfile = async (accessToken: string) => {
  const res = await fetch(`${baseUrl}/api/users/get-profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  console.log('res', res);
  const {profile, error} = await res.json();

  if (error) {
    return {error: error};
  }
  return {profile: profile};
}


export const getUserLinks = async (accessToken: string) => {
  const res = await fetch(`${baseUrl}/api/users/get-links`, {
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