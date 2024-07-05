import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { sessionCookie } from "~/utils/sessionCookie";
import supabase from "~/services/supabaseClient";
import {useState} from "react";

export const loader: LoaderFunction = async ({ request }) => {
  /* Handle Cookies */
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);

  const req = await fetch('http://localhost:3000/dashboard/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId: session?.sessionId}),
  });

  // checks if the user is authenticated
  const res = await req.json();

  console.log('res', res)

  // if the user is not authenticated, redirect to the login page
  if (!session || res.error) {
    return redirect("/");
  }
  return json({  });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get('action');

  if (actionType === 'logout') {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return json({ error: error.message }, { status: 500 });
    }

    // Clear the session cookie
    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionCookie.serialize("", { expires: new Date(0) }),
      }
    });
  }

  return json({ error: 'Unsupported action' }, { status: 400 });
};



const DashboardLinks = () => {
  const [loading, setLoading] = useState(false);

  const fetcher = useFetcher();

  const handleSignOut = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('action', 'logout');
    fetcher.submit(formData, { method: 'post', action: '/dashboard/links' });
    setLoading(false);
  };

  return (
      <div>
        {loading && <p>Signing out...</p>}
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
  );
};

export default DashboardLinks;