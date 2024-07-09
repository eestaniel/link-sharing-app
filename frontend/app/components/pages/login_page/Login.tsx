import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {setErrorMap, z} from 'zod';
import {zodResolver} from '@hookform/resolvers/zod';
import styles from './Login.module.css';
import {useFetcher} from "@remix-run/react";
import {useLinksStore} from "~/store/LinksStore";

// Define the validation schema using zod
const loginSchema = z.object({
  email: z.string().min(1, "Can't be empty").email(),
  password: z.string().min(1, 'Please check again'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;


const Login = () => {
  const {setCurrentPage, currentPage} = useLinksStore(state => ({
    setCurrentPage: state.setCurrentPage
  }));
  const [isLoading, setIsLoading] = useState(false);



  // Initialize the form with react-hook-form and zodResolver
  const {
    register,
    handleSubmit,
    setError,
    formState: {errors},
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const fetcher = useFetcher();

  // Define the submit handler
  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setError('password', {
      type: 'manual',
      message: ''
    })
    // Handle form submission

    const formData = new FormData();
    formData.append("action", "login");
    formData.append("email", data.email);
    formData.append("password", data.password);

    fetcher.submit(formData, {method: "post", action: "/auth"});

  };

  useEffect(() => {
    if (fetcher.data?.error) {
      // add invalid error to formState error password

      setError('password', {
        type: 'manual',
        message: fetcher.data.error
      })
    }
  }, [fetcher]);

  const handlePageChange = () => {

    setCurrentPage('create-account');
  }

  const handleAnon = () => {
    const formData = new FormData();
    formData.append("action", "anon");
    fetcher.submit(formData, {method: "post", action: "/auth"});
  }

  return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Login</h1>
          <h2>Add your details below to get back into the app</h2>
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
            Password:
            <div className={`${styles.input_container} ${errors.password && styles.input_error}`}>
              <img src="app/assets/images/icon-password.svg" alt="password icon"/>
              <input type="password" {...register('password')} placeholder={'Enter your password'}/>
            </div>
            {errors.password && <span className={styles.error}>{errors.password.message}</span>}
          </label>
          <button className={`${styles.button} ${isLoading && styles.is_loading}`} disabled={isLoading} type="submit">{isLoading ? 'Loading...' : 'Log in'}</button>
          <button className={styles.button} onClick={handleAnon}>Sign in Anonymously</button>

          <div className={styles.footer_group}>
            <p className={styles.dont_have_account}>Don't have an account?</p>
            <p className={styles.create_account} onClick={handlePageChange}>Create account</p>
          </div>
        </form>
      </div>
  );
};

export default Login;
