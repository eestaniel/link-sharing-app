import {Outlet} from "@remix-run/react"
import {redirect} from "@remix-run/node";
import Navigation from "~/components/navigation/Navigation";
import {LoaderFunction} from "@remix-run/node";
import {sessionCookie} from "~/utils/sessionCookie";
import styles from '../styles/Dashboard.module.css';

export const loader: LoaderFunction = async ({request}) => {

  redirect('/dashboard/links')

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