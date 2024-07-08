import { LoaderFunction, redirect } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { sessionCookie } from "~/utils/sessionCookie";
import { useEffect, useMemo } from "react";
import styles from "app/styles/dashboard.links.module.css";
import { useLinksStore } from "~/store/LinksStore";
import LinkSelection from "~/components/links_menu/LinkSelection";
import { EmptyLinksIcon } from "~/assets/svgs/IconSVGs";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

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

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    return redirect("/");
  }

  // Validate the access token
  const res = await fetch("http://localhost:3000/api/auth/validate", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });
  const resBody = await res.json();
  if (resBody.error) {
    const newCookieHeader = await sessionCookie.serialize("", { maxAge: 0 });
    return redirect("/", {
      headers: { "Set-Cookie": newCookieHeader },
    });
  }

  return null;
};

const DashboardLinks = () => {
  const { userLinks, setUserLinks, addLink, removeLink, editLinkUrl } = useLinksStore(state => ({
    userLinks: state.userLinks,
    setUserLinks: state.setUserLinks,
    addLink: state.addLink,
    removeLink: state.removeLink,
    editLinkUrl: state.editLinkUrl
  }));
  const fetcher = useFetcher();

  const methods = useForm<LinkFormInputs>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      links: []  // Initialize form with empty array
    }
  });

  // UseEffect to initialize state from local storage or fetch from server
  useEffect(() => {
    const storedLinks = localStorage.getItem('user_links');
    if (storedLinks) {
      const links = JSON.parse(storedLinks);
      setUserLinks(links);  // Update Zustand state from local storage
      methods.reset({ links });  // Reset form state with local storage data
    } else {
      const formData = new FormData();
      formData.append('action', 'get-links');
      fetcher.submit(formData, { method: 'post', action: '/auth' });
    }
  }, []); // Empty dependency array ensures this runs only on mount

  // UseEffect to update state from server response
  useEffect(() => {
    if (fetcher.data) {
      const { links } = fetcher.data as { links: any[] };
      setUserLinks(links);  // Update Zustand state
      localStorage.setItem('user_links', JSON.stringify(links));  // Cache in local storage
      methods.reset({ links });  // Reset form state with fetched data
    }
  }, [fetcher.data, setUserLinks, methods]);

  // UseEffect to reset form state when userLinks changes
  useEffect(() => {
    methods.reset({ links: userLinks });
  }, [userLinks, methods]);

  const {
    handleSubmit,
    setValue,
    getValues,
    formState: { errors }
  } = methods;

  const handleSignOut = async () => {
    //clear local storage
    const localStorageKeys = ['user_details', 'user_links'];
    localStorageKeys.forEach(key => localStorage.removeItem(key));

    const formData = new FormData();
    formData.append('action', 'logout');
    fetcher.submit(formData, { method: 'post', action: '/auth' });
  };

  const handleDisplayNewLink = () => {
    const id = generateUUID();
    const newLink = { id, platform: "github", url: "" };
    addLink(newLink); // Update Zustand state
    setValue('links', [...getValues('links'), newLink]);  // Update form state
  };

  const handleRemoveLink = (id: string) => {
    removeLink(id); // Update Zustand state
    setValue('links', getValues('links').filter((link: LinkFormInputs['links'][number]) => link.id !== id));  // Update form state
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

  const handleTest = async (data: LinkFormInputs) => {
    console.log(userLinks);
    console.log('current form data', data);
  };

  const renderLinksContent = useMemo(() => {
    if (userLinks.length === 0) {
      return (
        <div className={styles.empty_links}>
          <EmptyLinksIcon />
          <p>No links added yet</p>
        </div>
      );
    } else {
      return userLinks.map((object, index) => (
        <LinkSelection key={object.id} object={object} index={index}
                       onRemove={handleRemoveLink} />
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
              <p>Add/edit/remove links below and then share all your
                profiles with the world!</p>
            </header>
            <button type="button" className={styles.add_link_button}
                    onClick={handleDisplayNewLink}>+ Add new link
            </button>
            {renderLinksContent}
          </section>
          <footer>
            <button type="submit">Save</button>
            <button type="button"
                    onClick={handleSubmit(handleTest)}>Test
            </button>
            <button type="button" className={styles.sign_out}
                    onClick={handleSignOut}>Sign Out
            </button>
          </footer>
        </div>
      </form>
    </FormProvider>
  );
};

export default DashboardLinks;
