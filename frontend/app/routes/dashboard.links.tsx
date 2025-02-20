import {LoaderFunction} from "@remix-run/node";
import {Form, useFetcher} from "@remix-run/react";
import {useEffect, useMemo, useState} from "react";
import styles from "app/styles/dashboard.links.module.css";
import {useLinksStore} from "~/store/LinksStore";
import LinkSelection from "~/components/links_menu/LinkSelection";
import {EmptyLinksIcon} from "~/assets/svgs/IconSVGs";
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {FormProvider, useForm} from 'react-hook-form';
import {useDragAndDrop} from "@formkit/drag-and-drop/react"
import {validateCookieSession} from "~/utils/cookie-utils"

// Define the validation schema using zod
const linkSchema = z.object({
  links: z.array(
    z.object({
      id: z.string(),
      platform: z.string(),
      url: z.string().min(1, "Can't be empty").url(),
    })
  )
});

// Define the type for the form inputs
type LinkFormInputs = z.infer<typeof linkSchema>;

// Generate a UUID
const generateUUID = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  } else {
    return 'xxxx-xxxx-xxxx-xxxx'.replace(/[x]/g, () => {
      const r = (Math.random() * 16) | 0;
      return r.toString(16);
    });
  }
};

// Define the loader function
export const loader: LoaderFunction = async ({request}) => {
  const response = await validateCookieSession(request, '/dashboard');
  if (response) {
    return response
  }

  return {};
};



// Define the DashboardLinks component
const DashboardLinks = () => {


  // Get the userLinks, setUserLinks, addLink, removeLink, editLinkUrl, userDetails,
  const {
    userLinks, setUserLinks, addLink, removeLink,
    setShowToast, setToastMessage, dbLinks,
    setDbLinks
  } = useLinksStore(state => ({
    dbLinks: state.dbLinks,
    userLinks: state.userLinks, setUserLinks: state.setUserLinks,
    addLink: state.addLink, removeLink: state.removeLink,
    setShowToast: state.setShowToast,
    setToastMessage: state.setToastMessage,
    setDbLinks: state.setDbUserLinks
  }));
  
  
  
  // Get the fetcher function
  const fetcher = useFetcher() as any

  // Log the userLinks
  // useEffect(() => {
  //   console.log('userDetails:', userLinks);
  // }, []);


  // Initialize the form using react-hook-form
  const methods = useForm<LinkFormInputs>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      links: []  // Initialize form with empty array
    }
  });


  // Function to handle adding a new link
  const handleDisplayNewLink = () => {
    const id = generateUUID();
    const newLink = {id, platform: "github", url: ""};
    addLink(newLink);
    methods.setValue('links', [methods.getValues('links')[0], newLink, ...methods.getValues('links').slice(1)]);
  };


  // Function to handle removing a link
  const handleRemoveLink = (id: string) => {
    removeLink(id);
    methods.setValue('links', methods.getValues('links').filter((link: { id: string; }) => link.id !== id));
  };


  // Function to handle saving the links
  const [disableButton, setDisableButton] = useState(false);


  // Function to handle saving the links
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


  // Initialize the form with react-hook-form and zodResolver
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [isClient, setIsClient] = useState(false);


  // Show toast message when data is saved
  useEffect(() => {
    if (fetcher.data?.message) {
      setShowToast(fetcher.data.message);
      setToastMessage('Your changes have been successfully saved!')
      setDisableButton(false);

      // update dbLinks with userLinks
      setDbLinks(userLinks);
    }
  }, [fetcher.data]);

  // Set isClient to true when the component mounts
  useEffect(() => {
    setIsClient(true);

  }, []);


  // Check if the form has changed
  useEffect(() => {
    if (userLinks.length > 0 || dbLinks.length > 0) {
      if (JSON.stringify(userLinks) !== JSON.stringify(dbLinks)) {
        setIsFormChanged(true);
        methods.setValue('links', userLinks)
      } else {
        setIsFormChanged(false);
      }
    }
  }, [dbLinks, methods, userLinks]);


  // Initialize the form with react-hook-form and zodResolver
  const [formParent, formList, setFormList] = useDragAndDrop(
    userLinks,
    {
      group: 'formLinks',
      sortable: true,
      dragHandle: styles.grab_handle,
    }
  )


  // Update the formList when userLinks changes
  useEffect(() => {
    if (userLinks.length > 0) {
      setFormList(userLinks);
    }
  }, [setFormList, userLinks]);


  // Update the userLinks when formList changes
  useEffect(() => {
    if (formList.length > 0) {
      setUserLinks(formList);
    }
  }, [formList, setUserLinks]);

  // reset page on load
  useEffect(() => {
    if (dbLinks !== userLinks) {
      setUserLinks([]);
    }
  }, []);


  // Render the links content
  const renderLinksContent = useMemo(() => {
    if (userLinks.length === 0) {
      return (
        <div className={styles.empty_links_container}>
          <div className={styles.empty_links_content}>
            <EmptyLinksIcon/>
            <div className={styles.text_group}>
              <h2>Let&#39;s get you started</h2>
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
