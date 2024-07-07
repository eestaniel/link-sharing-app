import styles from "../styles/Dashboard.Profile.module.css"
import {FormProvider, useForm} from "react-hook-form"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {UploadImageIcon} from "~/assets/svgs/IconSVGs"

// Define zod schema for profile details
const profileSchema = z.object({
  first_name: z.string().min(1, "Can't be empty"),
  last_name: z.string().min(1, "Can't be empty"),
  email: z.string().email("Invalid email"),
  profile_picture: z.string().url().optional(), // Make optional and URL for an image path
});

type ProfileFormInputs = z.infer<typeof profileSchema>;


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

  const {handleSubmit, register, formState: {errors}} = methods;


  const handleTestButton = () => {
    console.log("Test button clicked");
    const data = methods.getValues(); // Directly access form values
    console.log(data);
  }

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