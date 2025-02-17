import {ActionFunction, json, LoaderFunction, redirect} from "@remix-run/node";
import {supabase} from "~/services/supabaseClient";
import {sessionCookie} from "~/utils/sessionCookie";


export const loader: LoaderFunction = async () => {
  return redirect("/");
};

export const action: ActionFunction = async ({request}) => {
  const formData = await request.formData();
  const actionType = formData.get('action');
  switch (actionType) {
    case 'anon':
      return await createAnonSession();
    case 'logout':
      return await signOut(request);
    case 'login':
      return await login(formData);

    case 'login-new-user':
      return await loginNewUser(formData);
    case 'create-account':
      return await createAccount(formData);

    case 'save-links':
      return await saveLinks(formData, request);
    case 'save-profile':
      return await saveProfile(formData, request);
    case 'change-page':
      return changePage(formData);
    default:
      return json({error: 'Unsupported action'}, {status: 400});
  }
};

const changePage = async (formData: FormData) => {
  const page = formData.get('page') as string;
  if (!page) {
    return redirect('/dashboard/links')
  }
  return redirect(page);

}

const createAnonSession = async () => {
  const response = await fetch(`${process.env.BASE_URL}/api/v1/auth/sign-in-anon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const {accessToken, error} = await response.json();

  if (error) {
    return json({error: error.message}, {status: 401});
  }

  const cookieHeader = await serializeSession(accessToken);
  return json({session: cookieHeader}, {
    headers: {"Set-Cookie": cookieHeader},
  });
}

const createAccount = async (formData: FormData) => {

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(`${process.env.BASE_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({email, password}),
  });

  const {message, error} = await response.json();

  if (error) {
    return json({error}, {status: 401});
  }


  return {message: message};
}


interface TokenPayload {
  accessToken: string;
  refreshToken: string;
}


const loginNewUser = async (formData: FormData) => {
  const accessToken = formData.get('access_token') as string;
  const refreshToken = formData.get('refresh_token') as string;

  // Set session data
  const {error} = await supabase.auth.setSession({
    access_token: accessToken, refresh_token: refreshToken
  });

  if (error) {
    return json({error: error.message}, {status: 500});
  }

  // Create a session cookie with the access token
  const cookieHeader = await sessionCookie.serialize({accessToken});

  return json(
      {session: accessToken},
      {headers: {"Set-Cookie": cookieHeader},
  });

}

const baseUrl = process.env.BASE_URL;
const login = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Send login request to backend
  const response = await fetch(`${process.env.BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({email, password}),
  });

  // If the login fails, return an error
  if (!response.ok) {
    return json({error: 'Invalid login'}, {status: response.status});
  }


  const cookieHeader = response.headers.get('set-cookie');

  return json(
      { message: "Login successful" },
      cookieHeader ? { headers: { "Set-Cookie": cookieHeader } } : {} // ✅ Forward cookie to browser
  );
};

const signOut = async (request: any) => {
  // Get the access token from the session cookie
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    return redirect("/");
  }

  // Sign out the user from supabase
  const {error} = await supabase.auth.signOut()

  if (error) {
    return json({error: error.message}, {status: 500});
  }

  // sign user out from backend
  const response = await fetch(`${baseUrl}/api/auth/signout`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  const res = await response.json();
  if (res.error) {
    return json({error: res.error}, {status: 401});
  }

  const newCookieHeader = await sessionCookie.serialize("", {maxAge: 0});
  return redirect("/", {
    headers: {"Set-Cookie": newCookieHeader},
  });
};

const saveLinks = async (formData: FormData, request: any) => {
  // Get the access token from the session cookie
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  // if no access token throw redirect /
  if (!accessToken) {
    return redirect("/");
  }

  const response = await fetch(`${baseUrl}/api/users/save-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      links: JSON.parse(formData.get('links') as string),
    }),
  });

  let responseBody = await response.json();
  if (responseBody.error) {
    return json({error: responseBody.error}, {status: 401});
  }

  return json({message: responseBody});
}

const saveProfile = async (formData: FormData, request: Request) => {
  // Get the access token from the session cookie
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  // if no access token, throw redirect /
  if (!accessToken) {
    throw redirect("/");
  }

  const response = await fetch(`${baseUrl}/api/users/save-profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,

    },
    body: formData,

  });

  const responseBody = await response.json();
  if (responseBody.error) {
    return json({error: responseBody.error}, {status: 401});
  }

  return {message: 'Profile saved'};
};

const serializeSession = async (accessToken: string) => {
  const sessionValue = {accessToken}
  // Serializing the cookie with the session value and maxAge set for 1
  // week
  return await sessionCookie.serialize(sessionValue, {
    maxAge: 60 * 60 * 24 * 7 // 1 week in seconds
  }); // Just return the cookie header string
}

