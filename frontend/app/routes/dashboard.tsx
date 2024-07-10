import {Outlet} from "@remix-run/react"
import {LoaderFunction, redirect} from "@remix-run/node";
import Navigation from "~/components/navigation/Navigation";
import styles from '../styles/Dashboard.module.css';
import {sessionCookie} from "~/utils/sessionCookie"
import {getData} from "~/services/user-services";

export const action = async ({request}: any) => {

  const formData = await request.formData();
  const page = formData.get('page') as string;

  console.log('here')
  const actionType = formData.get('action') as string;


  if (page) {
    switch (page) {
      case 'edit-links':
        return redirect('/dashboard/links')
      case 'edit-profile':
        return redirect('/dashboard/profile')
      case 'preview-links':
        return redirect('/dashboard/preview')
      default:
        return redirect('/dashboard/links')
    }
  }

  if (actionType) {
    switch (actionType) {
      case 'logout':
        return redirect('/logout')

      case 'get-data':
        return getData(request)

      default:
        return redirect('/dashboard/links')
    }
  }
}


const Dashboard = () => {


  console.log()

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