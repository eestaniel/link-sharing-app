import styles from "../login_page/Login.module.css";
import React, {useEffect, useState} from "react";
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import {useLinksStore} from "~/store/LinksStore";
import {useFetcher} from "@remix-run/react";

// Define the validation schema using zod
const createAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  //check is password and confirm password are the same
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters long')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type CreateFormInput = z.infer<typeof createAccountSchema>;


const CreateAccount = () => {
  const {setCurrentPage} = useLinksStore(state => ({
    setCurrentPage: state.setCurrentPage,
  }));
  // Initialize the form with react-hook-form and zodResolver
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm<CreateFormInput>({
    resolver: zodResolver(createAccountSchema),
  });

  const handlePageChange = () => {
    setCurrentPage('login');
  }

  const fetcher = useFetcher();

  const [isDisabled, setIsDisabled] = useState(false);

  const onSubmit = (data: CreateFormInput) => {
    setIsDisabled(true);
    const formData = new FormData();
    formData.append("action", "create-account");
    formData.append("email", data.email);
    formData.append("password", data.password);
    fetcher.submit(formData, { method: "post", action: "/auth" });
  }

  return (
      <div className={styles.login_container}>
        <header className={styles.header}>
          <h1>Create Account</h1>
          <h2>Let’s get you started sharing your links!</h2>
        </header>
        <form className={styles.form_container} onSubmit={handleSubmit(onSubmit)}>
          <label className={styles.input_group}>
            Email address:
            <div className={`${styles.input_container} ${errors.email && styles.input_error}`}>
              <img src="app/assets/images/icon-email.svg" alt="email icon"/>
              <input type="email" {...register('email')} placeholder={'e.g. alex@email.com'}/>
            </div>
            {errors.email && <span className={styles.error}>{errors.email.message}</span>}
          </label>
          <label className={styles.input_group}>
            Create Password:
            <div className={`${styles.input_container} ${errors.password && styles.input_error}`}>
              <img src="app/assets/images/icon-password.svg" alt="password icon"/>
              <input type="password" {...register('password')} placeholder={'At least 8 characters'}/>
            </div>
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </label>
          <label className={styles.input_group}>
            Confirm Password:
            <div className={`${styles.input_container} ${errors.password && styles.input_error}`}>
              <img src="app/assets/images/icon-password.svg" alt="password icon"/>
              <input type="password" {...register('confirmPassword')} placeholder={'At least 8 characters'}/>
            </div>
            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword.message}</span>}
          </label>
          <button className={styles.button} type="submit" onClick={handleSubmit(onSubmit)} disabled={isDisabled}>
            {isDisabled ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className={styles.footer_group}>
            <p className={styles.dont_have_account}>Already have an account?</p>
            <p className={styles.create_account} onClick={handlePageChange}>Login</p>
          </div>
        </form>


      </div>
  );
};

export default CreateAccount;