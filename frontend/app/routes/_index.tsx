import {
  MetaFunction,
  redirect,
  useLoaderData,
  useLocation
} from "@remix-run/react";
import {json, LoaderFunction} from "@remix-run/node";
import styles from "../styles/index.module.css";
import React, {useEffect, useMemo} from "react";
import {sessionCookie} from "~/utils/sessionCookie";
import Login from "~/components/pages/login_page/Login";
import Navigation from "~/components/navigation/Navigation";
import {useLinksStore} from '~/store/LinksStore';
import CreateAccount from "~/components/pages/create_account/CreateAccount";
import {validateAccessToken} from "~/services/user-services"
import {useNavigation} from "@remix-run/react"


export const meta: MetaFunction = () => {
  return [
    {title: "Social Link App"},
    {name: "description", content: "Welcome to Remix!"},
  ];
};

export const loader: LoaderFunction = async ({request}) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken;

  if (accessToken) {
    const req = await validateAccessToken(accessToken);
    if (req.error) {
      // Clear the cookie and redirect to login if token validation fails
      return redirect("/", {
        headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
      });
    }
    // Redirect to dashboard if the token is valid
    return redirect("/dashboard/links");
  }

  // If no accessToken, assume the user needs to login
  return json({homePage: 'login'});
};


export default function Index() {
  const {homePage} = useLoaderData<typeof loader>();
  const location = useLocation();
  const path = location.pathname;
  const transition = useNavigation();
  const isLoading = transition.state === 'loading';

  const {currentPage, setCurrentPage} = useLinksStore(state => ({
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
        return <CreateAccount/>;
      default:
        // 'login' is the default page
        return <Login isLoading={isLoading}/>;
    }
  }, [currentPage]);

  return (
    <div className={`${styles.main_content} ${path === '/' && styles.home_page} `}>
      <Navigation/>
      <div className={styles.content}>
        {renderPage}
      </div>
    </div>
  );
}
