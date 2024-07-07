import {json, LoaderFunction, redirect} from "@remix-run/node";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {sessionCookie} from "~/utils/sessionCookie";
import {useEffect, useMemo} from "react";
import styles from "app/styles/dashboard.links.module.css";
import {useLinksStore} from "~/store/LinksStore";
import LinkSelection from "~/components/links_menu/LinkSelection";
import {EmptyLinksIcon} from "~/assets/svgs/IconSVGs";
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, useForm} from 'react-hook-form';

// Define zod schema for link URLs
const linkSchema = z.object({
  links: z.array(
    z.object({
      id: z.string(),
      platform: z.string(),
      url: z.string().min(1, "Can't be empty").url(),
    })
  )
});

type LinkFormInputs = z.infer<typeof linkSchema>;

const generateUUID = () => {
  return crypto.randomUUID();
}


export const loader: LoaderFunction = async ({request}) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    throw redirect("/");
  }

  // Validate the access token
  const res = await fetch("http://localhost:3000/api/auth/validate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({accessToken}),
  });

  // If the access token is invalid, redirect to the home page and clear the session cookie
  const resBody = await res.json();
  if (resBody.error) {
    const newCookieHeader = await sessionCookie.serialize("", {maxAge: 0});
    return redirect("/", {
      headers: {"Set-Cookie": newCookieHeader},
    });
  }

  // Fetch the user's links from the database
  const fetchUserLinks = async () => {
    // Get user links from the database
    const res = await fetch("http://localhost:3000/api/users/get-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({accessToken}),
    });

    const resBody = await res.json();
    if (resBody.error) {
      throw json({error: resBody.error}, {status: 401});
    }
    return resBody.links;
  }

  const links = await fetchUserLinks();

  return json({links});
};


interface Link {
  id: string;
  platform: string;
  url: string;
}


const DashboardLinks = () => {
  const {userLinks, setUserLinks, addLink, removeLink, editLinkUrl} = useLinksStore(state => ({
    userLinks: state.userLinks,
    setUserLinks: state.setUserLinks,
    addLink: state.addLink,
    removeLink: state.removeLink,
    editLinkUrl: state.editLinkUrl
  }));

  useEffect(() => {
  }, [userLinks]);

  const {links} = useLoaderData<{ links: Link[] }>();
  const fetcher = useFetcher();


  // update global state with the fetched links from the database on initial load
  useEffect(() => {
    if (links) {
      setUserLinks(links)
    }
  }, []);

  // print userLinks on change
  useEffect(() => {
  }, [userLinks]);


  const methods = useForm<LinkFormInputs>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      links: links.map(link => ({
        id: link.id || generateUUID(), // Ensure each link has an ID
        platform: link.platform,      // Ensure platform is defined
        url: link.url                 // Ensure URL is defined
      })),
    } as LinkFormInputs
  });


  const {handleSubmit, setValue, getValues, formState: {errors}} = methods;

  const handleSignOut = async () => {
    const formData = new FormData();
    formData.append('action', 'logout');
    fetcher.submit(formData, {method: 'post', action: '/auth'});
  };

  const handleDisplayNewLink = () => {
    const id = generateUUID();
    const newLink = { id, platform: "github", url: "" };
    addLink(newLink); // Update global state
    // reset the form with the new link
    setValue('links', [...getValues('links'), newLink]);
  };

  const handleRemoveLink = (id: string) => {
    removeLink(id); // Update global state
    setValue('links', getValues('links').filter((link: Link) => link.id !== id));
  };

  const handleSaveLinks = async (data: LinkFormInputs) => {

    try {
      const formData = new FormData();
      formData.append("action", "save-links");
      formData.append("links", JSON.stringify(data.links));
      fetcher.submit(formData, { method: "post", action: "/auth" });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };


  const handleTest = async (data:LinkFormInputs) => {
    console.log(userLinks)
    console.log('current form data', data)
  }

  const renderLinksContent = useMemo(() => {
    if (userLinks.length === 0) {
      return (
        <div className={styles.empty_links}>
          <EmptyLinksIcon/>
          <p>No links added yet</p>
        </div>
      );
    } else {
      return userLinks.map((object, index) => (
        <LinkSelection key={object.id} object={object} index={index} onRemove={handleRemoveLink}/>
      ));
    }
  }, [userLinks]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSaveLinks)}>
        <div className={styles.container}>
          <section className={styles.content}>
            <header className={styles.header}>
              <h1>Customize your links</h1>
              <p>Add/edit/remove links below and then share all your profiles with the world!</p>
            </header>
            <button type="button" className={styles.add_link_button} onClick={handleDisplayNewLink}>+ Add new link
            </button>
            {renderLinksContent}
          </section>
          <footer>
            <button type="submit">Save</button>
            <button type="button" onClick={handleSubmit(handleTest)}>Test</button>
            <button type="button" className={styles.sign_out} onClick={handleSignOut}>Sign Out</button>
          </footer>
        </div>
      </form>
    </FormProvider>
  );
};

export default DashboardLinks;
