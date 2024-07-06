import {ActionFunction, json, LoaderFunction, redirect} from "@remix-run/node";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {sessionCookie} from "~/utils/sessionCookie";
import supabase from "~/services/supabaseClient";
import {useEffect, useState} from "react";
import styles from "app/styles/dashboard.links.module.css"
import {useLinksStore} from "~/store/LinksStore";

interface LoaderData {
  sessionId: string;
}


export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);

  // Ensure user is authenticated
  if (!session.accessToken) {
    return redirect("/");
  }

  // Fetch data as required, for authenticated users only
  const res = await fetch('http://localhost:3000/dashboard/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session: session.accessToken }),
  });

  const result = await res.json();
  if (result.error) {
    return redirect("/");
  }

  // Continue to load the dashboard if no error
  return json({ sessionId: session.sessionId });
};



export const action: ActionFunction = async ({request}) => {

  const formData = await request.formData();
  const actionType = formData.get('action');

  if (actionType === 'logout') {
    const {error} = await supabase.auth.signOut();

    if (error) {
      return json({error: error.message}, {status: 500});
    }

    // Clear the session cookie
    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionCookie.serialize("", {expires: new Date(0)}),
      }
    });
  }

  return json({error: 'Unsupported action'}, {status: 400});
};


const DashboardLinks = () => {
  const { setSessionId } = useLinksStore(state => ({
    setSessionId: state.setSessionId
  }));
  const { sessionId } = useLoaderData<LoaderData>();

  useEffect(() => {
    if (sessionId) {
      setSessionId(sessionId);
    }
  }, [sessionId, setSessionId]);

  const fetcher = useFetcher();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('action', 'logout');
    formData.append('sessionId', sessionId);
    fetcher.submit(formData, { method: 'post', action: '/auth' });
    setLoading(false);
  };

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Customize your links</h1>
          <p>Add/edit/remove links below and then share all your profiles with the world!</p>
        </header>
        <section className={styles.content}>
          <button className={styles.add_link_button}>+ Add new link</button>
          <div className={styles.links_container}></div>
        </section>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
  );
};

export default DashboardLinks;