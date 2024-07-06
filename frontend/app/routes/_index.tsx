import { MetaFunction, useLoaderData, redirect } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/node";
import styles from "../styles/index.module.css";
import React, { useEffect, useMemo } from "react";
import { sessionCookie } from "~/utils/sessionCookie";
import Login from "~/components/pages/login_page/Login";
import Navigation from "~/components/navigation/Navigation";
import { useLinksStore } from '~/store/LinksStore';
import CreateAccount from "~/components/pages/create_account/CreateAccount";
import { useLocation } from "react-router";
import {style} from "@vanilla-extract/css";

export const meta: MetaFunction = () => {
  return [
    { title: "Social Link App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const url = new URL(request.url);
  const currentPath = url.pathname;

  // Redirect logic ensuring no infinite loops
  if (session?.accessToken) {
    // User is authenticated
    if (currentPath !== "/dashboard/links") {
      return redirect("/dashboard/links");
    }
  } else {
    // User is not authenticated
    if (currentPath !== "/") {
      return redirect("/");
    }
  }

  // Data for authenticated or default entry page
  return json({
    homePage: 'login',
    session,
  });
};



export default function Index() {
  const { homePage } = useLoaderData<typeof loader>();
  const location = useLocation();
  const path = location.pathname;

  const { currentPage, setCurrentPage } = useLinksStore(state => ({
    currentPage: state.currentPage,
    setCurrentPage: state.setCurrentPage,
  }));

  useEffect(() => {
    // Set the current page to the home page on initial load
    setCurrentPage(homePage);
  }, [homePage, setCurrentPage]);

  const renderPage = useMemo(() => {
    switch (currentPage) {
      case 'create-account':
        return <CreateAccount />;
      default:
        // 'login' is the default page
        return <Login />;
    }
  }, [currentPage]);

  return (
      <div className={`${styles.container} ${path === '/'&& styles.home_page} `}>
        <Navigation />
        <div className={styles.content}>
          {renderPage}
        </div>
      </div>
  );
}
