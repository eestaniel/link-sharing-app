import styles from "../styles/Dashboard.Profile.module.css";
import {FormProvider, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {UploadImageIcon} from "~/assets/svgs/IconSVGs";
import {useLinksStore} from "~/store/LinksStore";
import {useEffect, useRef, useState} from "react";
import {useFetcher, useLoaderData} from "@remix-run/react";
import {LoaderFunction, redirect} from "@remix-run/node";
import {sessionCookie} from "~/utils/sessionCookie";
import {getData} from "~/services/user-services";
import {parseCookieHeader} from "~/utils/parseCookieHeader"
import {validateCookieSession} from "~/utils/cookie-utils"

// Define zod schema for profile details
const profileSchema = z.object({
  first_name: z.string().min(1, "Can't be empty"),
  last_name: z.string().min(1, "Can't be empty"),
  email: z.string().optional(),
  file: z.any().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;



export const loader: LoaderFunction = async ({request}) => {
  const response = await validateCookieSession(request, '/dashboard');
  if (response) {
    return response
  }

  return {}
}



const DashboardProfile = () => {

  // Initialize the form with react-hook-form and zodResolver
  const methods = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      file: null,
    },
  });


  // Fetch the data from the loader
  const fetcher = useFetcher();


  // Initialize the store and set the user details and links from the store
  const {
    dbLinks,
    dbUserDetails,
    userDetails,
    userLinks,
    setUserDetails,
    setUserLinks,
    setShowToast,
    setToastMessage
  } = useLinksStore((state) => ({
    dbLinks: state.dbLinks,
    dbUserDetails: state.dbUserDetails,
    userDetails: state.userDetails,
    userLinks: state.userLinks,
    setUserDetails: state.setUserDetails,
    setUserLinks: state.setUserLinks,
    setShowToast: state.setShowToast,
    setToastMessage: state.setToastMessage,
  }));


  // Initialize the state for form changes and client
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [isClient, setIsClient] = useState(false);


  // Destructure the methods from react-hook-form
  const {
    handleSubmit,
    register,
    formState: {errors},
    setError,
  } = methods;

  // Create a reference for the file
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize the state for image data and disable button
  const [imageData, setImageData] = useState<{
    url: string;
    file: any
  } | string | null>(null);
  const [disableButton, setDisableButton] = useState(false);


  // Set DB user details to the form on load
  useEffect(() => {
    if (dbUserDetails) {
      methods.reset(dbUserDetails);
    }
  }, [dbUserDetails]);


  // Log the userDetails
  // useEffect(() => {
  //   console.log('userDetails', userDetails);
  // }, []);


  // Validate email
  const validEmail = (email: string) => {
    return z.string().email().safeParse(email);
  }

  // Save the form data
  const handleSaveForm = async (data: ProfileFormInputs) => {
    setDisableButton(true);

    // check if email is empty
    const formData = new FormData();
    formData.append("action", "save-profile");
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);

    console.log('form data', formData);
    if (data.email) {
      // check if email is valid
      const emailValidation = validEmail(data.email);
      if (emailValidation.success) {
        formData.append("email", data.email);
      } else {
        setError('email', {
          type: 'manual',
          message: 'Invalid email'
        });
        setDisableButton(false);
        return;
      }
    }
    if (data.file) {
      formData.append("file", data.file);
    }
    // Assuming you want to handle the fetch call yourself, otherwise use
    // fetcher
    fetcher.submit(formData, {
      method: "POST",
      action: "/auth",
      encType: "multipart/form-data",
    });
    setUserDetails(data);
  };

  // Show toast message when data is saved
  useEffect(() => {
    if (fetcher.data?.message) {
      setShowToast(fetcher.data.message);
      setToastMessage('Your changes have been successfully saved!')
      setDisableButton(false);
    }
  }, [fetcher.data]);

  // Set isClient to true
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    setUserDetails({
      first_name: "",
      last_name: "",
      email: "",
    });
    setUserLinks([]);

    const formData = new FormData();
    formData.append('action', 'logout');
    fetcher.submit(formData, {method: 'post', action: '/auth'});
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file: any = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('image')) {
        alert('Invalid file type. Allowed types are jpg, jpeg, png.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Max image size is 5MB.');
        return;
      }

      // Creating an object URL for efficient rendering
      const url = URL.createObjectURL(file);
      setImageData({url, file});
      methods.setValue('file', file);
    }
  };

  // Watch for changes in the form
  useEffect(() => {
    const subscription = methods.watch((value) => {
      const hasNameChanged = value.first_name !== userDetails.first_name
        || value.last_name !== userDetails.last_name
        || value.email !== userDetails.email
        || value.file !== userDetails.file
      ;
      if (hasNameChanged) {
        setIsFormChanged(true);
      } else {
        setIsFormChanged(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods]);

  // reset page on load
  useEffect(() => {
    if (dbLinks !== userLinks) {
      setUserLinks([]);
    }
  }, []);

  const renderImage = () => {
    if (dbUserDetails?.url && !imageData) {
      return (
        <>
          <img src={dbUserDetails?.url} alt=""/>
          <span className={styles.layer}>
            <UploadImageIcon/>
            <p>Change Image</p>
          </span>
        </>
      );
    } else if (imageData) {
      return (
        <>
          <img src={imageData?.url} alt=""/>
          <span className={styles.layer}>
            <UploadImageIcon/>
            <p>Change Image</p>
          </span></>
      );
    } else {
      return (
        <div className={styles.upload_icon_group}>
          <UploadImageIcon/>
          <span>+ Upload Image</span>
        </div>
      );
    }
  };

  return (
    <div className={styles.profile_container}>
      <div className={styles.profile_content}>
        <div className={styles.form_header_container}>
          <header className={styles.profile_header}>
            <h1>Profile Details</h1>
            <p>Add your details to create a personal touch to your
              profile.</p>
          </header>
          <FormProvider {...methods} >
            <form onSubmit={handleSubmit(handleSaveForm)}
                  className={styles.img_detail_container}
            >
              <div className={styles.picture_container}>
                <div className={styles.picture_content}>
                  <p className={styles.text_profile_picture}>Profile
                    picture</p>
                  <div className={styles.picture_group}>
                    <div
                      className={styles.picture_svg_container}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                      />
                      <div className={styles.picture_input_container}>
                        {renderImage()}
                      </div>
                    </div>
                    <p>Image must be below 1024x1024px. Use PNG or JPG
                      format.</p>
                  </div>
                </div>
              </div>
              <div className={styles.details_container}>
                <div
                  className={`${styles.input_container} ${errors.first_name && styles.input_error}`}>
                  <label htmlFor="first_name">First name*</label>
                  <input {...register('first_name')} type="text"/>
                  {errors.first_name && <p
                    className={styles.error_text}>{errors.first_name.message}</p>}
                </div>
                <div
                  className={`${styles.input_container} ${errors.last_name && styles.input_error}`}>
                  <label htmlFor="last_name">Last name*</label>
                  <input {...register('last_name')} type="text"/>
                  {errors.last_name && <p
                    className={styles.error_text}>{errors.last_name.message}</p>}
                </div>
                <div
                  className={`${styles.input_container} ${errors.email && styles.input_error}`}>
                  <label htmlFor="email">Email</label>
                  <input {...register('email')} type="text"/>
                  {errors.email &&
                    <p
                      className={styles.error_text}>{errors.email.message}</p>}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <footer className={styles.footer_container}>
        <div className={styles.button_group}>
          <button type="submit" onClick={handleSubmit(handleSaveForm)}
                  disabled={(!isFormChanged && isClient) || disableButton}>
            {disableButton ? "Saving..." : "Save"}
          </button>
          <button type="submit" onClick={handleSignOut}
                  className={styles.sign_out}>
            Sign Out
          </button>
        </div>
      </footer>
    </div>
  );
};

export default DashboardProfile;
