import {ActionFunction, json, LoaderFunction, redirect} from "@remix-run/node";
import {supabase} from "~/services/supabaseClient";
import { sessionCookie } from "~/utils/sessionCookie";


export const loader: LoaderFunction = async ( ) => {
  return redirect("/");
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get('action');
  switch (actionType) {
    case 'anon':
      return await createAnonSession();
    case 'logout':
      return await signOut(formData);
    case 'login':
      return await login(formData);

    case 'create-account':
      return await createAccount(formData);
    default:
      return json({ error: 'Unsupported action' }, { status: 400 });
  }
};

const createAnonSession = async () => {
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error) {
    return json({ error: error.message }, { status: 401 });
  }

  const cookieHeader = await serializeSession(data?.session);

  return json({ sessionID: data?.session?.access_token }, {
    headers: { "Set-Cookie": cookieHeader }
  });
}

const createAccount = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });


  if (error) {
    return json({ error: error.message }, { status: 401 });
  }

  return json({message: 'Please confirm email to login'}, { status: 200 });
}

interface TokenPayload {
  accessToken: string;
  refreshToken: string;
}

const login = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch('http://localhost:3000/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const res: TokenPayload & { error?: string } = await response.json();

  if (res.error) {
    return json({ error: res.error }, { status: 401 });
  }

  const { accessToken, refreshToken } = res;

  // Set session data
  const { data, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken
  });


  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  // Create a session cookie with the access token
  const cookieHeader = await sessionCookie.serialize({ accessToken });


  return json({ session:  accessToken}, {
    headers: { "Set-Cookie": cookieHeader },
  });
};


const signOut = async (formData: FormData) => {

  const { error } = await supabase.auth.signOut()

  if (error) {
    return json({ error: error.message }, { status: 500 });
  }

  const { data: { user } } = await supabase.auth.getUser()

  // Clear the session cookie
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionCookie.serialize("", { expires: new Date(0) }),
    }
  });
};

const serializeSession = async (accessToken: string) => {
  const sessionValue = { accessToken }
  // Serializing the cookie with the session value and maxAge set for 1 week
  const cookieHeader = await sessionCookie.serialize(sessionValue, {
    maxAge: 60 * 60 * 24 * 7 // 1 week in seconds
  });

  return cookieHeader; // Just return the cookie header string
}

