import {Outlet} from "@remix-run/react"
import Navigation from "~/components/navigation/Navigation";
import {LoaderFunction} from "@remix-run/node";
import {sessionCookie} from "~/utils/sessionCookie";
export const loader: LoaderFunction = async ({request}) => {


  /* Handle Cookies */
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);

  return { message: "This is a secret message from the server!"};
}

const Dashboard = () => {
  return (
      <div>
        <Navigation />
        <Outlet />
      </div>
  );
};

export default Dashboard;