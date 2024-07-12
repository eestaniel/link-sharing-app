import {LoaderFunction, redirect} from "@remix-run/node";
import {Form, useFetcher, useLoaderData} from "@remix-run/react";
import {sessionCookie} from "~/utils/sessionCookie";
import {useEffect, useMemo, useState} from "react";
import styles from "app/styles/dashboard.links.module.css";
import {useLinksStore} from "~/store/LinksStore";
import LinkSelection from "~/components/links_menu/LinkSelection";
import {EmptyLinksIcon} from "~/assets/svgs/IconSVGs";
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, useForm} from 'react-hook-form';
import {getData} from "~/services/user-services";
import {useDragAndDrop} from "@formkit/drag-and-drop/react"


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
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return r.toString(16);
    });
  }
};

export const loader: LoaderFunction = async ({request}) => {
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

  return {links, profile};
};

const DashboardLinks = () => {
  const {
    userLinks,
    setUserLinks,
    addLink,
    removeLink,
    editLinkUrl,
    userDetails,
    setUserDetails,
    setShowToast
  } = useLinksStore(state => ({
    userLinks: state.userLinks,
    setUserLinks: state.setUserLinks,
    addLink: state.addLink,
    removeLink: state.removeLink,
    editLinkUrl: state.editLinkUrl,
    userDetails: state.userDetails,
    setUserDetails: state.setUserDetails,
    setShowToast: state.setShowToast,
  }));

  const fetcher = useFetcher() as any;

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
  }, [links, profile, setUserLinks, setUserDetails, methods]);

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
    methods.setValue('links', [methods.getValues('links')[0], newLink, ...methods.getValues('links').slice(1)]);
  };

  const handleRemoveLink = (id: string) => {
    removeLink(id);
    methods.setValue('links', methods.getValues('links').filter((link: any) => link.id !== id));
  };

  const [disableButton, setDisableButton] = useState(false);
  ;

  const handleSaveLinks = async (data: LinkFormInputs) => {
    try {
      setDisableButton(true);
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
    if (fetcher.data?.message) {
      setShowToast(fetcher.data.message);
      setDisableButton(false);
    }
  }, [fetcher.data]);

  useEffect(() => {
    setIsClient(true);

  }, []);

  useEffect(() => {
    if (links.length > 0 || userLinks.length > 0) {
      if (JSON.stringify(links) !== JSON.stringify(userLinks)) {
        setIsFormChanged(true);
        methods.setValue('links', userLinks)
      } else {
        setIsFormChanged(false);
      }
    }
  }, [userLinks, links]);

  const [formParent, formList, setFormList] = useDragAndDrop(
    userLinks,
    {
      group: 'formLinks',
      sortable: true,
      dragHandle: styles.grab_handle,
    }
  )

  useEffect(() => {
    if (userLinks.length > 0) {
      setFormList(userLinks);
    }
  }, [userLinks]);

  useEffect(() => {
    if (formList.length > 0) {
      setUserLinks(formList);
    }

  }, [formList]);

  const renderLinksContent = useMemo(() => {
    if (userLinks.length === 0) {
      return (
        <div className={styles.empty_links_container}>
          <div className={styles.empty_links_content}>
            <EmptyLinksIcon/>
            <div className={styles.text_group}>
              <h2>Let's get you started</h2>
              <p>Use the “Add new link” button to get started. Once you have
                more than one link, you can reorder and edit them. We’re here to
                help you share your profiles with everyone!</p>
            </div>
          </div>
        </div>
      );
    } else {
      return formList.map((object, index) => (
        <li key={object.id}>
          <LinkSelection object={object} index={index}
                         onRemove={handleRemoveLink}/>
        </li>
      ));
    }
  }, [userLinks, formList]);

  return (
    <FormProvider {...methods}>
      <Form className={styles.dashboard_form_container} method="post"
            onSubmit={methods.handleSubmit(handleSaveLinks)}>
        <div className={styles.dashboard_content_container}>
          <div className={styles.dashboard_content}>
            <section className={styles.header_links_container}>
              <header className={styles.header}>
                <h1>Customize your links</h1>
                <p>Add/edit/remove links below and then share all your profiles
                  with the world!</p>
              </header>
              <div className={styles.links_container}>
                <button type="button" className={styles.add_link_button}
                        onClick={handleDisplayNewLink}>
                  + Add new link
                </button>
                <ul ref={formParent} className={styles.links_content}>
                  {renderLinksContent}
                </ul>
              </div>
            </section>
          </div>
          <footer>
            <button type="submit" className={styles.save_button}
                    disabled={(!isFormChanged && isClient) || disableButton}>
              {disableButton ? "Saving..." : "Save"}
            </button>
          </footer>
        </div>
        <input type="hidden" name="links"
               value={JSON.stringify(methods.getValues('links'))}/>
      </Form>
    </FormProvider>
  );
};

export default DashboardLinks;
