import styles from "../styles/Dashboard.Preview.module.css"
import {useLinksStore} from "~/store/LinksStore"
import {
  linkMenuList,
  LinkMenuStyles
} from "~/components/links_menu/LinkMenu"
import {LinkMenuIcons} from "~/components/links_menu/LinkMenuIcons"
import {RightArrowIcon} from "~/assets/svgs/IconSVGs"
import {json, LoaderFunction, redirect} from "@remix-run/node"
import {sessionCookie} from "~/utils/sessionCookie"
import {useLoaderData} from "@remix-run/react"
import {useEffect} from "react"


export const loader: LoaderFunction = async ({request}) => {
  // time this function
  let start = Date.now();

  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    throw redirect("/");

  }

  // Fetch the user's profile details from the database
  const fetchUserProfile = async () => {
    const response = await fetch('http://localhost:3000/api/users/get-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const responseBody = await response.json();
    if (responseBody.error) {
      console.log(`Error fetching user profile: ${responseBody.error}`)
      return redirect("/");
    }
    return responseBody.profile;
  }

  // Fetch the user's links from the database
  const fetchUserLinks = async () => {
    // Get user links from the database
    const res = await fetch("http://localhost:3000/api/users/get-links", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    /* TODO: Implement refresh token server side on jwt expire */
    const resBody = await res.json();
    if (resBody.error) {
      throw redirect("/");
    }
    return resBody.links;
  }

  const links = await fetchUserLinks()
  const userProfile = await fetchUserProfile();

  const newObject = {
    links,
    userProfile
  }

  console.log(`Time to load data ${Date.now() - start}ms`);
  return json(newObject);


}


const DashboardPreview = () => {
  const {userDetails, userLinks, setUserLinks, setUserDetails} = useLinksStore((state) => ({
    userDetails: state.userDetails,
    userLinks: state.userLinks,
    setUserLinks: state.setUserLinks,
    setUserDetails: state.setUserDetails
  }));
  const {links, userProfile} = useLoaderData<{ links: any, userProfile: any }>();

  useEffect(() => {
    if (links){
      setUserLinks(links)
    }
    if (userProfile){
      setUserDetails(userProfile)
    }
  }, []);

  const renderLinksContent = () => {
    if (userLinks.length === 0) {
      return (
        <div className={styles.empty_links_container}>
          <p>No links added yet</p>
        </div>
      )
    } else {
      return (
        userLinks.map((link, index) => (
          <div
            className={`${styles.button_container} ${LinkMenuStyles(link.platform)}`}>
            <div
              className={`${styles.icon_label_group} ${LinkMenuStyles(link.platform)}`}>
              <div className={`${styles.svg_container} `}>
                {LinkMenuIcons[link.platform as keyof typeof LinkMenuIcons]}
              </div>
              {linkMenuList[link.platform as keyof typeof linkMenuList]}
            </div>
            <div
              className={`${styles.right_arrow_container} ${LinkMenuStyles(link.platform)}`}>
              <RightArrowIcon/>
            </div>
          </div>
        )))
    }
  }

  return (
    <div className={styles.preview_container}>
      <section className={styles.picture_header_container}>
        <div className={styles.picture_container}>
          <img src={userDetails?.url?.publicUrl}
               alt="dashboard preview"/>
        </div>
        <header className={styles.header_group}>
          <h1>{userDetails?.first_name} {userDetails?.last_name}</h1>
          <p>{userDetails?.email}</p>
        </header>
      </section>
      <section className={styles.links_container}>
        {renderLinksContent()}
      </section>


    </div>
  );
};

export default DashboardPreview;