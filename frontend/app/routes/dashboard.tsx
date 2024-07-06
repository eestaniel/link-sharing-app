import {Outlet} from "@remix-run/react"
import Navigation from "~/components/navigation/Navigation";
import {LoaderFunction} from "@remix-run/node";
import {sessionCookie} from "~/utils/sessionCookie";
import styles from '../styles/Dashboard.module.css';

export const loader: LoaderFunction = async ({request}) => {


  /* Handle Cookies */
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);

  return {message: "This is a secret message from the server!"};
}

const Dashboard = () => {
  return (
      <div className={styles.page_container}>
        <Navigation/>
        <div className={styles.dashboard_container}>

          <Outlet/>
        </div>
      </div>

  );
};

export default Dashboard;