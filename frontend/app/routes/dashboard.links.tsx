import {createCookie, json, LoaderFunction, redirect,} from "@remix-run/node";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {sessionCookie} from "~/utils/sessionCookie";
import {useCallback, useState} from "react";
import styles from "app/styles/dashboard.links.module.css"
import {useLinksStore} from "~/store/LinksStore";
import LinkSelection from "~/components/links_menu/LinkSelection";
import {EmptyLinksIcon} from "~/assets/svgs/IconSVGs"


const userLinksCookie = createCookie("user-links", {
  maxAge: 60 * 60 * 24 * 7, // 1 week in seconds
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
});


interface LoaderData {
  sessionId: string;
}


function generateUUID() {
  return crypto.randomUUID();
}

export const loader: LoaderFunction = async ({request}) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    throw redirect("/");
  }

  console.log('accessToken', accessToken)

  // Check if user is trying to access /dashboard/links while not authenticated
  const url = new URL(request.url);
  if (!accessToken && url.pathname === "/dashboard/links") {
    const newCookieHeader = await sessionCookie.serialize("", {maxAge: 0});
    return redirect("/", {
      headers: {"Set-Cookie": newCookieHeader},
    });
  }

  // Validate the access token
  const res = await fetch("http://localhost:3000/api/auth/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({accessToken}),
  });

  const resBody = await res.json();
  if (resBody.error) {
    const newCookieHeader = await sessionCookie.serialize("", {maxAge: 0});
    return redirect("/", {
      headers: {"Set-Cookie": newCookieHeader},
    });
  }




  const fetchUserLinks = async () => {
    /*     const res = await fetch("http://localhost:3000/dashboard/links", {
     method: "POST",
     headers: {
     "Content-Type": "application/json",
     },
     body: JSON.stringify({ session: session?.accessToken }),
     });

     const result = await res.json();
     if (result.error) {
     const newCookieHeader = await sessionCookie.serialize("", { maxAge: 0 });
     return redirect("/", {
     headers: { "Set-Cookie": newCookieHeader },
     });
     }

     return result.links; */
    return [{id: '1', platform: 'twitter', url: 'https://x.com'}];
  };

  // Read userLinks from the cookie
  const userLinks = await userLinksCookie.parse(cookieHeader);
  const linksStore = useLinksStore.getState();

  if (userLinks && userLinks.length > 0) {
    linksStore.setUserLinks(userLinks);
    return json({links: userLinks});
  } else {
    const links = await fetchUserLinks();
    linksStore.setUserLinks(links);
    return json({links});
  }
};


interface Link {
  id: string;
  platform: string;
  url: string;
}


const DashboardLinks = () => {
  const {userLinks} = useLinksStore((state) => ({
    userLinks: state.userLinks,
  }));

  const {links} = useLoaderData<{ links: Link[] }>();

  const [localLinks, setLocalLinks] = useState<Link[]>(links);
  const fetcher = useFetcher();

  const handleSignOut = async () => {
    const formData = new FormData();
    formData.append('action', 'logout');
    fetcher.submit(formData, {method: 'post', action: '/auth'});
  };

  const handleDisplayNewLink = () => {
    const id = generateUUID();
    setLocalLinks((prevLinks) => [...prevLinks, {id, platform: "github", url: ""}]);
  };

  const handleRemoveLink = (id: string) => {
    setLocalLinks((prevLinks) => prevLinks.filter((link) => link.id !== id));
  };


  const renderLinksContent = useCallback(() => {
    if (localLinks?.length === 0) {
      return (
        <div className={styles.links_container}>
          <EmptyLinksIcon/>
          <h2>Let’s get you started</h2>
          <p>
            Use the “Add new link” button to get started. Once you have more than one link, you can reorder and edit
            them. We’re here to help you share your profiles with everyone!
          </p>
        </div>
      );
    } else {
      return (
        <div className={styles.links_container}>
          {localLinks.map((object, index) => (
            <LinkSelection key={object.id} index={index} object={object} onRemove={handleRemoveLink}/>
          ))}
        </div>
      );
    }
  }, [localLinks, handleRemoveLink]);

  return (
    <div className={styles.container}>
      <section className={styles.content}>
        <header className={styles.header}>
          <h1>Customize your links</h1>
          <p>Add/edit/remove links below and then share all your profiles with the world!</p>
        </header>
        <button className={styles.add_link_button} onClick={handleDisplayNewLink}>+ Add new link</button>
        {renderLinksContent()}
      </section>
      <footer>
        <button>Save</button>
        <button className={styles.sign_out} onClick={handleSignOut}>Sign Out</button>
      </footer>
    </div>
  );
};

export default DashboardLinks;
