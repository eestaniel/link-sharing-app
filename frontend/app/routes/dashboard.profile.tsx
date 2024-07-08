import styles from "../styles/Dashboard.Profile.module.css"
import {FormProvider, useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {UploadImageIcon} from "~/assets/svgs/IconSVGs"
import {useLinksStore} from "~/store/LinksStore"
import {useEffect, useRef, useState} from "react";
import {useFetcher} from "@remix-run/react"
import {LoaderFunction, redirect} from "@remix-run/node";
import {sessionCookie} from "~/utils/sessionCookie";

// Define zod schema for profile details
const profileSchema = z.object({
  first_name: z.string().min(1, "Can't be empty"),
  last_name: z.string().min(1, "Can't be empty"),
  email: z.string().email("Invalid email"),
  file: z.any().refine((file) => {
    file?.size >= 5 * 1024 * 1024, `Max image size is 5MB.`
  }).refine((file) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      img.width <= 1024 && img.height <= 1024, `Image must be below 1024x1024px.`
    }
  }).refine((file) => {
    file?.type === 'image/png' || file?.type === 'image/jpg' || file?.type === 'image/jpeg', `Use PNG or JPG format.`
  })
});


type ProfileFormInputs = z.infer<typeof profileSchema>;


export const loader: LoaderFunction = async ({request}) => {
  // time this function
  let start = Date.now();

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
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  // If the access token is invalid, redirect to the home page and
  // clear the session cookie
  const resBody = await res.json();
  const url = new URL(request.url);
  if (resBody.error && url.pathname === "/dashboard/profile") {
    const newCookieHeader = await sessionCookie.serialize("", {maxAge: 0});
    return redirect("/", {
      headers: {"Set-Cookie": newCookieHeader},
    });
  }
  console.log(`Time to validate access Token ${Date.now() - start}ms`);
  return null;

}


interface ProfileLoaderData {
  userProfile: {
    first_name: string;
    last_name: string;
    email: string;
    file?: any;
  }

}


const DashboardProfile = () => {
  const methods = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      file: ''
    }
  });
  const fetcher = useFetcher();

  const {userDetails, setUserDetails} = useLinksStore((state) => ({
    userDetails: state.userDetails,
    setUserDetails: state.setUserDetails
  }));

  useEffect(() => {
    const storedDetails = localStorage.getItem('user_details');
    if (storedDetails) {
      const details = JSON.parse(storedDetails);
      setUserDetails(details);  // Update Zustand store
      methods.reset(details);  // Reset form values using react-hook-form
    } else {
      const formData = new FormData();
      formData.append("action", "get-profile");
      fetcher.submit(formData, {method: "POST", action: "/auth"});
    }
    }, []);


  interface ProfileLoaderData {
    profile: {
      first_name: string;
      last_name: string;
      email: string;
      url: {
        publicUrl: string;
      }
    }

  }
  useEffect(() => {
    if (fetcher.data) {
      const { profile } = fetcher.data as ProfileLoaderData;
      setUserDetails(profile);  // Update Zustand store
      localStorage.setItem('user_details', JSON.stringify(profile));  // Cache new data
      methods.reset(profile);  // Reset form with new data
    }
  }, [fetcher.data]);  // Depend on fetcher.data



  useEffect(() => {
    if (!userDetails.first_name && !userDetails.last_name && !userDetails.email) {
      const formData = new FormData();
      formData.append("action", "get-profile");
      fetcher.submit(formData, {method: "POST", action: "/auth"})
    }
  } , []);  // Depend on userDetails state

  useEffect(() => {
    // This only runs if userDetails changes outside of form interactions
    if (userDetails) {
      methods.reset(userDetails);
    }
  }, []);  // Depend on userDetails state


  // create dumme userProfile
  const userProfile = {
    first_name: "John",
    last_name: "Doe",
    email: "",
  }
  const {handleSubmit, register, formState: {errors}} = methods;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState<{
    url: string,
    file: any
  } | string | null>(null);


  const handleSaveForm = async () => {
    const data = methods.getValues(); // Directly access form values

    setUserDetails(data);

    const formData = new FormData();
    formData.append("action", "save-profile");
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    if (data.file) {
      formData.append("file", data.file);
    } else {
      formData.append("file", '');
    }


    fetcher.submit(formData, {
      method: "POST",
      action: "/auth",
      encType: "multipart/form-data"
    })
  }
  const handleTestButton = () => {
    // update the global state with the form values
    setUserDetails(methods.getValues())

  }


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Creating an object URL for efficient rendering
      const url = URL.createObjectURL(file);
      setImageData({url, file: file});
      methods.setValue('file', file);
    }
  }

  const renderImage = () => {
    if (userDetails?.url?.publicUrl && !imageData) {
      return (
        <img src={userDetails?.url?.publicUrl} alt="profile picture"/>
      )
    } else if (imageData) {
      return (
        <img src={imageData?.url} alt="profile picture"/>
      )
    } else {
      return (
        <UploadImageIcon/>
      )
    }
  }


  return (
    <div className={styles.profile_container}>
      <div className={styles.profile_content}>
        <header className={styles.profile_header}>
          <h1>Profile Details</h1>
          <p>Add your details to create a personal touch to your
            profile.</p>
        </header>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleSaveForm)}
                className={styles.form_container}
          >
            <div className={styles.picture_container}>
              <div className={styles.picture_content}>
                <p>Profile picture</p>
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
                    <div className={styles.svg_group}>
                      {renderImage()}

                    </div>
                  </div>
                  <p>Image must be below 1024x1024px. Use PNG or JPG
                    format.</p>
                </div>
              </div>
            </div>
            <div className={styles.details_container}>
              <div className={styles.input_container}>
                <label htmlFor="first_name">First name*</label>
                <input {...register('first_name')} type="text"/>
                {errors.first_name && <p
                  className={styles.error_text}>{errors.first_name.message}</p>}
              </div>
              <div className={styles.input_container}>
                <label htmlFor="last_name">Last name*</label>
                <input {...register('last_name')} type="text"/>
                {errors.last_name && <p
                  className={styles.error_text}>{errors.last_name.message}</p>}
              </div>
              <div className={styles.input_container}>
                <label htmlFor="email">Email</label>
                <input {...register('email')} type="email"/>
                {errors.email &&
                  <p
                    className={styles.error_text}>{errors.email.message}</p>}
              </div>
            </div>
            <button type="button"
                    onClick={handleSaveForm}
                    disabled={!imageData}

            >Save
            </button>
            <button type="button" onClick={handleTestButton}>Test
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default DashboardProfile;