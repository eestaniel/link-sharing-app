import {LoaderFunction, redirect} from "@remix-run/node";
import {useFetcher, useLoaderData, useNavigation} from "@remix-run/react";
import {sessionCookie} from "~/utils/sessionCookie";
import {useEffect, useMemo} from "react";
import styles from "app/styles/dashboard.links.module.css";
import {useLinksStore} from "~/store/LinksStore";
import LinkSelection from "~/components/links_menu/LinkSelection";
import {EmptyLinksIcon} from "~/assets/svgs/IconSVGs";
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, useForm} from 'react-hook-form';
import {getUserLinks} from "~/services/user-services"

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
  // time this function
  let start = Date.now();
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    // remove cookie
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }

  const userLinks = await getUserLinks(accessToken);

  if (userLinks.error) {
    // remove cookie
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }

  console.log(`Time to validate access Token for Links Page:  ${Date.now() - start}ms`);

  return userLinks;
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

  const transition = useNavigation();
  const isLoad = transition.state === 'loading';


  interface data {
    links: {
      id: string;
      platform: string;
      url: string;
    }[];
  }


  const data = useLoaderData() as data;

  useEffect(() => {
    if (data) {
      console.log('has data', data)
      setUserLinks(data.links);
      methods.reset(data.links)
    }
  }, []);


  useEffect(() => {
    if (userLinks) {
      console.log('userLinks', userLinks)
    }
  }, [userLinks]);

  const {
    handleSubmit,
    setValue,
    getValues,
    formState: {errors}
  } = methods;

  const handleSignOut = async () => {
    //clear local storage
    const localStorageKeys = ['user_details', 'user_links'];
    localStorageKeys.forEach(key => localStorage.removeItem(key));

    const formData = new FormData();
    formData.append('action', 'logout');
    fetcher.submit(formData, {method: 'post', action: '/auth'});
  };

  const handleDisplayNewLink = () => {
    const id = generateUUID();
    const newLink = {id, platform: "github", url: ""};
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
      fetcher.submit(formData, {method: "post", action: "/auth"});
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleTest = async (data: LinkFormInputs) => {
    console.log(userLinks);
    console.log('current form data', data);
  };

  const renderLinksContent = useMemo(() => {
    if (userLinks) {
      if (userLinks.length === 0) {
        return (
          <div className={styles.empty_links}>
            <EmptyLinksIcon/>
            <p>No links added yet</p>
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
    </>

  );
};

export default DashboardLinks;
