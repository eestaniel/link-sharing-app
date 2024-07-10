import styles from "../styles/Dashboard.Preview.module.css";
import { useLinksStore } from "~/store/LinksStore";
import {
  linkMenuList,
  LinkMenuStyles
} from "~/components/links_menu/LinkMenu";
import { LinkMenuIcons } from "~/components/links_menu/LinkMenuIcons";
import { RightArrowIcon } from "~/assets/svgs/IconSVGs";
import { LoaderFunction, redirect } from "@remix-run/node";
import { sessionCookie } from "~/utils/sessionCookie";
import {useFetcher, useLoaderData} from "@remix-run/react";
import { useEffect } from "react";
import {getData} from "~/services/user-services"

export const loader: LoaderFunction = async ({ request }) => {

  const start = Date.now();
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    // remove cookie
    return redirect("/", {
      headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) }
    });
  }

  // Verify the access token without fetching user data
  const {links, profile, error} = await getData(accessToken);

  if (error) {
    // remove cookie
    return redirect("/", {
      headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) }
    });
  }

  console.log(`Time to validate access Token for Preview Page: ${Date.now() - start}ms`);
  return {links, profile};
};

const DashboardPreview = () => {
  const {
    userDetails,
    userLinks,
    setUserLinks,
    setUserDetails
  } = useLinksStore((state) => ({
    userDetails: state.userDetails,
    userLinks: state.userLinks,
    setUserLinks: state.setUserLinks,
    setUserDetails: state.setUserDetails
  }));
  const {links, profile} = useLoaderData() as any;

  useEffect(() => {
    if (links && profile) {
      setUserLinks(links);
      setUserDetails(profile);

      console.log(links)

    }
  }, [links, profile]);


  const renderLinksContent = () => {
    if (userLinks.length == 0) {
      return (
        <div className={styles.empty_links_container}>
          <p>No links added yet</p>
        </div>
      );
    } else {
      return (
        userLinks.map((link, index) => (
          <div
            key={index}
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
              <RightArrowIcon />
            </div>
          </div>
        ))
      );
    }
  };



  return (
    <div className={styles.preview_container}>
      <section className={styles.picture_header_container}>
        <div className={styles.picture_container}>
          <img src={userDetails?.url} alt="dashboard preview" />
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
