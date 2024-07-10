import {Outlet} from "@remix-run/react"
import {redirect} from "@remix-run/node";
import Navigation from "~/components/navigation/Navigation";
import styles from '../styles/Dashboard.module.css';
import {sessionCookie} from "~/utils/sessionCookie"


export const action = async ({request}: any) => {

  const formData = await request.formData();
  const page = formData.get('page') as string;

  const actionType = formData.get('action') as string;

  console.log('page', page)
  if (page) {
    console.log('page', page)
    switch (page) {
      case 'edit-links':
      case '/dashboard/links':
        return redirect('/dashboard/links')
      case 'edit-profile':
      case '/dashboard/profile':
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

      case 'save-links':
        return await saveLinks(formData, request);

      default:
        return redirect('/dashboard/links')
    }
  }
}


const saveLinks = async (formData: any, request: any) => {
  // Get the access token from the session cookie
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  // if no access token throw redirect /
  if (!accessToken) {
    return redirect("/");
  }

  const response = await fetch('http://localhost:3000/api/users/save-links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      links: JSON.parse(formData.get('links') as string),
    }),
  });

  let responseBody = await response.json();
  if (responseBody.error) {
    return {error: responseBody.error}
  }

  return {message: responseBody}
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