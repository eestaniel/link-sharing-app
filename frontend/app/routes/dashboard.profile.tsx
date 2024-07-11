import styles from "../styles/Dashboard.Profile.module.css";
import {FormProvider, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {UploadImageIcon} from "~/assets/svgs/IconSVGs";
import {useLinksStore} from "~/store/LinksStore";
import {useEffect, useRef, useState} from "react";
import {useFetcher, useLoaderData, useNavigation} from "@remix-run/react";
import {LoaderFunction, redirect} from "@remix-run/node";
import {sessionCookie} from "~/utils/sessionCookie";
import {getData} from "~/services/user-services";
import {Jsonify} from "@remix-run/server-runtime/dist/jsonify";

// Define zod schema for profile details
const profileSchema = z.object({
  first_name: z.string().min(1, "Can't be empty"),
  last_name: z.string().min(1, "Can't be empty"),
  email: z.string().email("Invalid email"),
  file: z.any().optional(),
});

type ProfileFormInputs = z.infer<typeof profileSchema>;

export const loader: LoaderFunction = async ({request}) => {
  let start = Date.now();

  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})},
    });
  }
  const {profile, links, error} = await getData(accessToken);

  if (error) {
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})},
    });
  }
  console.log(`Time to validate access Token for Profile Page: ${Date.now() - start}ms`);

  return {profile, links};
};


interface ProfileLoaderData {
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    url?: string;
  };
}


const DashboardProfile = () => {
  const methods = useForm<ProfileFormInputs>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      file: undefined,
    },
  });
  const fetcher = useFetcher();

  const {userDetails, setUserDetails, setUserLinks} = useLinksStore((state) => ({
    userDetails: state.userDetails,
    setUserDetails: state.setUserDetails,
    setUserLinks: state.setUserLinks
  }));

  const transition = useNavigation();



  const [isFormChanged, setIsFormChanged] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const {links, profile} = useLoaderData() as any;

  useEffect(() => {
    if (profile) {
      setUserDetails(profile);
      methods.reset(profile);
    }
    if (links) {
      setUserLinks(links);
    }

  }, [profile, links, methods]);

  const {handleSubmit, register, formState: {errors}, watch} = methods;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState<{
    url: string;
    file: any
  } | string | null>(null);

  const handleSaveForm = async () => {
    const data = methods.getValues();
    setUserDetails(data);

    const formData = new FormData();
    formData.append("action", "save-profile");
    formData.append("first_name", data.first_name);
    formData.append("last_name", data.last_name);
    formData.append("email", data.email);
    if (data.file) {
      formData.append("file", data.file);
    }

    fetcher.submit(formData, {
      method: "POST",
      action: "/auth",
      encType: "multipart/form-data",
    });
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
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

  useEffect(() => {
    const subscription = methods.watch((value, {name, type}) => {
      const isDifferent = (
        value.first_name !== userDetails.first_name ||
        value.last_name !== userDetails.last_name ||
        value.email !== userDetails.email ||
        (value.file && (imageData?.file !== value.file))
      );
      setIsFormChanged(isDifferent);
    });
    return () => subscription.unsubscribe();
  }, [methods, userDetails, imageData]);

  const renderImage = () => {
    if (userDetails?.url && !imageData) {
      return (
        <>
          <img src={userDetails?.url} alt="profile picture"/>
          <span className={styles.layer}>
            <UploadImageIcon/>
            <p>Change Image</p>
          </span>
        </>
      );
    } else if (imageData) {
      return (
        <>
          <img src={imageData?.url} alt="profile picture"/>
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
            <p>Add your details to create a personal touch to your profile.</p>
          </header>
          <FormProvider {...methods} >
            <form onSubmit={handleSubmit(handleSaveForm)}
                  className={styles.img_detail_container}
            >
              <div className={styles.picture_container}>
                <div className={styles.picture_content}>
                  <p className={styles.text_profile_picture}>Profile picture</p>
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
                    <p className={styles.error_text}>{errors.email.message}</p>}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
      <footer className={styles.footer_container}>
        <div className={styles.button_group}>
          <button type="button" onClick={handleSaveForm}
                  disabled={!isFormChanged && isClient}>
            Save
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
