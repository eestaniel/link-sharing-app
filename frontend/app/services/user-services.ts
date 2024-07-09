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

export const getProfile = async (accessToken: string) => {
  const res = await fetch('http://localhost:3000/api/users/get-profile', {
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