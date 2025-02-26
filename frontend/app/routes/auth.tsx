import {ActionFunction, json, LoaderFunction, redirect} from "@remix-run/node";
import {supabase} from "~/services/supabaseClient";
import {sessionCookie} from "~/utils/sessionCookie";
import {parseCookieHeader} from "~/utils/parseCookieHeader"
import {validateCookieSession} from "~/utils/cookie-utils"


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

  // If the create account fails, return an error
  if (!response.ok) {
    //return json({error: 'Invalid login'}, {status: response.status});
    return new Response(
      JSON.stringify(({error: 'Invalid login'})),
      {
        status: response.status,
      }
    )
  }

  // If the create account is successful, set the session cookie
  const cookieHeader = response.headers.get('set-cookie');



  // Return a success message and set the session cookie
  return new Response(
    JSON.stringify(({message: 'User logged in'})),
    {
      status: 200,
      headers: cookieHeader ? {"Set-Cookie": cookieHeader} : {},
    }
  );
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
    body: JSON.stringify({email, password}),
  });

  const cookieHeader = response.headers.get('set-cookie');
  // If the login fails, return an error
  if (!response.ok) {
    //return json({error: 'Invalid login'}, {status: response.status});
    return json({error: 'Invalid login'}, {
      status: response.status,
      headers: cookieHeader ? {"Set-Cookie": cookieHeader} : {},
    });
  }

  return json({message: 'User logged in'},{
    headers: cookieHeader ? {"Set-Cookie": cookieHeader} : {},
    status: 200,
  })
}

const signOut = async (request: Request) => {
  const cookieHeader = request.headers.get('Cookie') as string
  const cookie = parseCookieHeader(cookieHeader) as { [key: string]: string };


  if (!cookie.sb_session) {
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }


  // sign user out from backend
  const response = await fetch(`${baseUrl}/api/v1/auth/signout`, {
    method: 'POST',
    headers: {
      'Cookie': request.headers.get('Cookie') as string,
    }
  });

  if (!response.ok) {
    //return json({error: 'Invalid login'}, {status: response.status});
    return json({error: 'Invalid login'}, {status: response.status});
  }

  // Return a success message and set the sb_session cookie to expire
  const newCookieHeader = response.headers.get('set-cookie');
  return json({message: 'User logged out'},
    {
      status: 200,
      headers: newCookieHeader ? {"Set-Cookie": newCookieHeader} : {},
    });
};

const saveLinks = async (formData: FormData, request: Request) => {
  const cookieResponse = await validateCookieSession(request, '/dashboard');
  if (cookieResponse) {
    return cookieResponse
  }

  const response = await fetch(`${baseUrl}/api/v1/users/links`, {
    method: 'PUT',
    headers: {
      'Cookie': request.headers.get('Cookie') as string,
    },
    body: formData,
  });

  const responseBody = await response.json();
  if (responseBody.error) {
    return json({error: responseBody.error}, {status: 500})
  }


  const cookieHeader = response.headers.get('set-cookie');
  
  return json({message: responseBody},
    {
      headers: cookieHeader ? {"Set-Cookie": cookieHeader} : {},
      status: 200,
    })
}

const saveProfile = async (formData: FormData, request: Request) => {
  const cookieResponse = await validateCookieSession(request, '/dashboard');
  if (cookieResponse) {
    return cookieResponse
  }
  const response = await fetch(`${baseUrl}/api/v1/users/profile`, {
    method: 'PUT',
    headers: {
      'Cookie': request.headers.get('Cookie') as string,
    },
    body: formData,
  });

  const responseBody = await response.json();
  if (responseBody.error) {
    return json({error: responseBody.error}, {status: 500});
  }

  const cookieHeader = response.headers.get('set-cookie');

  return json({message: responseBody},
    {
      headers: cookieHeader ? {"Set-Cookie": cookieHeader} : {},
      status: 200,
    })
};

const serializeSession = async (accessToken: string) => {
  const sessionValue = {accessToken}
  // Serializing the cookie with the session value and maxAge set for 1
  // week
  return await sessionCookie.serialize(sessionValue, {
    maxAge: 60 * 60 * 24 * 7 // 1 week in seconds
  }); // Just return the cookie header string
}

