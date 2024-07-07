import styles from "../styles/Dashboard.Profile.module.css"
import {FormProvider, useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {UploadImageIcon} from "~/assets/svgs/IconSVGs"
import {useLinksStore} from "~/store/LinksStore"
import {useEffect} from "react"
import {useFetcher, useLoaderData} from "@remix-run/react"
import {json, LoaderFunction, redirect} from "@remix-run/node";
import {sessionCookie} from "~/utils/sessionCookie";

// Define zod schema for profile details
const profileSchema = z.object({
  first_name: z.string().min(1, "Can't be empty"),
  last_name: z.string().min(1, "Can't be empty"),
  email: z.string().email("Invalid email"),
  profile_picture: z.string().url().optional(), // Make optional and URL for an image path
});

type ProfileFormInputs = z.infer<typeof profileSchema>;


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

  // Fetch the user's profile details from the database
  const fetchUserProfile = async () => {
    const response = await fetch('http://localhost:3000/api/users/get-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: accessToken,
      }),
    });

    const responseBody = await response.json();
    if (responseBody.error) {
      return redirect("/");
    }

    return responseBody.profile;
  }

  const userProfile = await fetchUserProfile();
  console.log('user profile: ', userProfile)

  return json({userProfile});

}

const DashboardProfile = () => {
  const methods = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      profile_picture: "",
    }
  });
  const {userProfile} = useLoaderData();
  const {handleSubmit, register, formState: {errors}} = methods;

  const {userDetails, editUserDetails, setUserDetails} = useLinksStore((state) => ({
    userDetails: state.userDetails,
    editUserDetails: state.editUserDetails,
    setUserDetails: state.setUserDetails
  }));

  const fetcher = useFetcher();

  const handleTestButton = () => {
    const data = methods.getValues(); // Directly access form values
    console.log('form data: ', data);
    editUserDetails(data);

    const formData = new FormData();
    formData.append("action", "save-profile");
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    formData.append("profile_picture_url", data.profile_picture);

    fetcher.submit(formData, {
      method: "POST",
      action: "/auth"
    })
  }

  useEffect(() => {
    if (userProfile) {
      setUserDetails(userProfile)
      //update the form with the user profile details
      methods.setValue('first_name', userProfile.first_name);
      methods.setValue('last_name', userProfile.last_name);
      methods.setValue('email', userProfile.email);
      methods.setValue('profile_picture', userProfile.profile_picture_url);

    }
  }, [userProfile]);
  useEffect(() => {
    console.log("Zustand user details updated: ", userDetails);
  }, [userDetails]);

  return (
    <div className={styles.profile_container}>
      <div className={styles.profile_content}>
        <header className={styles.profile_header}>
          <h1>Profile Details</h1>
          <p>Add your details to create a personal touch to your profile.</p>
        </header>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit} className={styles.form_container}>
            <div className={styles.picture_container}>
              <div className={styles.picture_content}>
                <p>Profile picture</p>
                <div className={styles.picture_group}>
                  <div className={styles.picture_svg_container}>
                    <div className={styles.svg_group}>
                      <div className={styles.svg_img_container}>
                        <UploadImageIcon/>
                      </div>
                      <p>+ Upload Image</p>
                    </div>
                  </div>
                  <p>Image must be below 1024x1024px. Use PNG or JPG format.</p>
                </div>
              </div>
            </div>
            <div className={styles.details_container}>
              <div className={styles.input_container}>
                <label htmlFor="first_name">First name*</label>
                <input {...register('first_name')} type="text"/>
                {errors.first_name && <p className={styles.error_text}>{errors.first_name.message}</p>}
              </div>
              <div className={styles.input_container}>
                <label htmlFor="last_name">Last name*</label>
                <input {...register('last_name')} type="text"/>
                {errors.last_name && <p className={styles.error_text}>{errors.last_name.message}</p>}
              </div>
              <div className={styles.input_container}>
                <label htmlFor="email">Email</label>
                <input {...register('email')} type="email"/>
                {errors.email && <p className={styles.error_text}>{errors.email.message}</p>}
              </div>
            </div>
            <button type="submit">Save</button>
            <button type="button" onClick={handleTestButton}>Test</button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default DashboardProfile;