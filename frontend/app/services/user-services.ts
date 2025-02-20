

export const getData = async (request: Request) => {
  const res = await fetch(`${process.env.BASE_URL}/api/v1/users/profile-with-links`, {
    method: 'GET',
    headers: {
      'Cookie': request.headers.get('Cookie') as string
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
