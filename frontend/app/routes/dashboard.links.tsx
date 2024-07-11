import {LoaderFunction, redirect} from "@remix-run/node";
import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {sessionCookie} from "~/utils/sessionCookie";
import {useEffect, useMemo, useState} from "react";
import styles from "app/styles/dashboard.links.module.css";
import {useLinksStore} from "~/store/LinksStore";
import LinkSelection from "~/components/links_menu/LinkSelection";
import {EmptyLinksIcon, RightArrowIcon} from "~/assets/svgs/IconSVGs";
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, useForm} from 'react-hook-form';
import {getData} from "~/services/user-services"
import {LinkMenuIcons} from "~/components/links_menu/LinkMenuIcons"
import {linkMenuList, LinkMenuStyles} from "~/components/links_menu/LinkMenu"

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
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    // Fallback to another method if crypto.randomUUID is not available
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return r.toString(16);
    });
  }
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

  const {links, profile, error} = await getData(accessToken);
  if (error) {
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }
  console.log(`Time to validate access Token for Links Page:  ${Date.now() - start}ms`);
  return {links, profile}
};

const DashboardLinks = () => {
  const {
    userLinks,
    setUserLinks,
    addLink,
    removeLink,
    editLinkUrl,
    userDetails,
    setUserDetails
  } = useLinksStore(state => ({
    userLinks: state.userLinks,
    setUserLinks: state.setUserLinks,
    addLink: state.addLink,
    removeLink: state.removeLink,
    editLinkUrl: state.editLinkUrl,
    userDetails: state.userDetails,
    setUserDetails: state.setUserDetails
  }));
  const fetcher = useFetcher();

  const methods = useForm<LinkFormInputs>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      links: []  // Initialize form with empty array
    }
  });

  const {links, profile} = useLoaderData() as any;

  useEffect(() => {
    if (links) {
      setUserLinks(links);
      methods.reset({links});
    }

    if (profile) {
      setUserDetails(profile);
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

  const [isFormChanged, setIsFormChanged] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const subscription = methods.watch((value, {name, type}) => {
      const isDifferent = (
        JSON.stringify(value.links) !== JSON.stringify(userLinks)
      );
      setIsFormChanged(isDifferent);
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  const renderLinksContent = useMemo(() => {
    if (userLinks) {
      if (userLinks.length === 0) {
        return (
          <div className={styles.empty_links_container}>
            <div className={styles.empty_links_content}>
              <EmptyLinksIcon/>
              <div className={styles.text_group}>
                <h2>Let's get you started</h2>
                <p>Use the “Add new link” button to get started. Once you have
                  more
                  than one link, you can reorder and edit them. We’re here to
                  help
                  you share your profiles with everyone!</p>
              </div>
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
        <Form className={styles.dashboard_form_container} method="post"
              onSubmit={handleSubmit(handleSaveLinks)}
        >

          <div className={styles.dashboard_content_container}>
            <div className={styles.dashboard_content}>
              <section className={styles.header_links_container}>
                <header className={styles.header}>
                  <h1>Customize your links</h1>

                  <p>Add/edit/remove links below and then share all your
                    profiles
                    with the world!</p>
                </header>
                <div className={styles.links_container}>
                  <button type="button"
                          className={styles.add_link_button}
                          onClick={handleDisplayNewLink}
                  >

                    + Add new link
                  </button>
                  <div className={styles.links_content}>
                    {renderLinksContent}
                  </div>
                </div>
              </section>
            </div>
            <footer>
              <button type="submit"
                      className={styles.save_button}
                      disabled={!isFormChanged && isClient}

              >Save
              </button>
            </footer>
          </div>


          <input type="hidden" name="links"
                 value={JSON.stringify(getValues('links'))}/>
        </Form>
      </FormProvider>
    </>
  );
};

export default DashboardLinks;
