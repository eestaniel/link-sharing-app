import {LoaderFunction, redirect} from "@remix-run/node";
import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {sessionCookie} from "~/utils/sessionCookie";
import {useEffect, useMemo} from "react";
import styles from "app/styles/dashboard.links.module.css";
import {useLinksStore} from "~/store/LinksStore";
import LinkSelection from "~/components/links_menu/LinkSelection";
import {EmptyLinksIcon} from "~/assets/svgs/IconSVGs";
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, useForm} from 'react-hook-form';
import {getData} from "~/services/user-services"

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
  let start = Date.now();
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }

  const {links, error} = await getData(accessToken);
  if (error) {
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }
  console.log(`Time to validate access Token for Links Page:  ${Date.now() - start}ms`);
  return links;
};

const DashboardLinks = () => {
  const {
    userLinks,
    setUserLinks,
    addLink,
    removeLink,
    editLinkUrl
  } = useLinksStore(state => ({
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

  const links = useLoaderData() as any;

  useEffect(() => {
    if (links) {
      console.log("Links", links);
      setUserLinks(links);
      methods.reset({links});
    }
  }, [links, setUserLinks, methods]);

  const {
    handleSubmit,
    setValue,
    getValues,
    formState: {errors}
  } = methods;

  const handleSignOut = async () => {
    const localStorageKeys = ['user_details', 'user_links'];
    localStorageKeys.forEach(key => localStorage.removeItem(key));

    const formData = new FormData();
    formData.append('action', 'logout');
    fetcher.submit(formData, {method: 'post', action: '/auth'});
  };

  const handleDisplayNewLink = () => {
    const id = generateUUID();
    const newLink = {id, platform: "github", url: ""};
    addLink(newLink);
    setValue('links', [...getValues('links'), newLink]);
  };

  const handleRemoveLink = (id: string) => {
    removeLink(id);
    setValue('links', getValues('links').filter((link: LinkFormInputs['links'][number]) => link.id !== id));
  };

  const handleSaveLinks = async (data: LinkFormInputs) => {
    try {
      const formData = new FormData();
      formData.append("action", "save-links");
      formData.append("links", JSON.stringify(data.links));
      fetcher.submit(formData, {method: "post", action: "/auth"});
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };


  const renderLinksContent = useMemo(() => {
    if (userLinks) {
      if (userLinks.length === 0) {
        return (
          <div className={styles.empty_links_container}>
            <div className={styles.empty_links_content}>
              <EmptyLinksIcon/>
              <h2>Let's get you started</h2>
              <p>Use the “Add new link” button to get started. Once you have more
                than one link, you can reorder and edit them. We’re here to help
                you share your profiles with everyone!</p>
            </div>
          </div>
        );
      } else {
        return userLinks.map((object, index) => (
          <LinkSelection key={object.id} object={object} index={index}
                         onRemove={handleRemoveLink}/>
        ));
      }
    }
  }, [userLinks]);

  return (
    <>
      <FormProvider {...methods}>
        <Form className={styles.dashboard_container} method="post"
              onSubmit={handleSubmit(handleSaveLinks)}>

          <section className={styles.dashboard_content}>
            <header className={styles.header}>
              <h1>Customize your links</h1>

              <p>Add/edit/remove links below and then share all your profiles
                with the world!</p>
            </header>
            <div className={styles.links_content}>
              <button type="button" className={styles.add_link_button}
                      onClick={handleDisplayNewLink}>
                + Add new link
              </button>
              {renderLinksContent}
            </div>
          </section>
          <footer>
            <button type="submit">Save</button>
            {/*               <button type="button" className={styles.sign_out}
             onClick={handleSignOut}>
             Sign Out
             </button> */}
          </footer>

          <input type="hidden" name="links"
                 value={JSON.stringify(getValues('links'))}/>
        </Form>
      </FormProvider>
    </>
  );
};

export default DashboardLinks;
