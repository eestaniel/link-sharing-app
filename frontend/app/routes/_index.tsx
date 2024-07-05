import { MetaFunction, useLoaderData, redirect } from "@remix-run/react";
import { LoaderFunction, json } from "@remix-run/node";
import styles from "../styles/index.module.css";
import React, { useEffect, useMemo } from "react";
import { sessionCookie } from "~/utils/sessionCookie";
import Login from "~/components/pages/login_page/Login";
import Navigation from "~/components/navigation/Navigation";
import { useLinksStore } from '~/store/LinksStore';
import CreateAccount from "~/components/pages/create_account/CreateAccount";

export const meta: MetaFunction = () => {
  return [
    { title: "Social Link App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  /* Handle Cookies */
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);

  if (session) {
    return redirect("/dashboard/links");
  } else {
    const homePage = 'login';
    return json({
      homePage,
      session,
    });
  }
};

export default function Index() {
  const { homePage } = useLoaderData<typeof loader>();

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
        return <Login />;
    }
  }, [currentPage]);

  return (
      <div className={styles.container}>
        <Navigation />
        <div className={styles.content}>
          {renderPage}
        </div>
      </div>
  );
}
