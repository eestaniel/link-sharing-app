import {
  MetaFunction,
  redirect, useFetcher,
  useLoaderData,
  useLocation
} from "@remix-run/react";
import {LoaderFunction} from "@remix-run/node";
import styles from "../styles/index.module.css";
import {useEffect, useMemo} from "react";
import Login from "~/components/pages/login_page/Login";
import Navigation from "~/components/navigation/Navigation";
import {useLinksStore} from '~/store/LinksStore';
import CreateAccount from "~/components/pages/create_account/CreateAccount";
import {validateAccessToken} from "~/services/user-services"
import {useNavigation,useNavigate} from "@remix-run/react"
import {parseCookieHeader} from "~/utils/parseCookieHeader";
import {validateCookieSession} from "~/utils/cookie-utils"
import {red} from "kleur/colors"
import {sessionCookie} from "~/utils/sessionCookie"

export const meta: MetaFunction = () => {
  return [
    {title: "Social Link App"},
    {name: "description", content: "Welcome to Remix!"},
  ];
};


export const loader: LoaderFunction = async ({request}) => {
  const response = await validateCookieSession(request, '/')
  if (response) {
    return response
  }

  return {}
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
  const navigate = useNavigate();
  const fetcher = useFetcher();
  // this use effect checks if user has a hash from confirmation email
  useEffect(() => {
    const processToken = async () => {
      const params = new URLSearchParams(location.hash.slice(1)); // Remove the '#' and parse
      if (!params.has('access_token')) return;

      const formData = new FormData();
      formData.append("action", "login-new-user");
      formData.append("access_token", params.get('access_token') as string);
      formData.append("refresh_token", params.get('refresh_token') as string);
      fetcher.submit(formData, {method: "post", action: "/auth"})
    };

    processToken();
  }, []);

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
