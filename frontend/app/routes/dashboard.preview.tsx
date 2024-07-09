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
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

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
  const response = await fetch("http://localhost:3000/api/auth/validate", {
    method: "POST",
    headers: { "Authorization": `Bearer ${accessToken}` },
  });
  const responseBody = await response.json();
  if (responseBody.error) {
    return redirect("/", {
      headers: { "Set-Cookie": await sessionCookie.serialize("", { maxAge: 0 }) }
    });
  }

  console.log(`Time to validate access Token for Preview Page: ${Date.now() - start}ms`);
  // Only authenticate, no data return needed
  return null;
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
  const fetcher = useFetcher();

  useEffect(() => {
    // Check Local Storage for user details
    const storedUserDetails = localStorage.getItem('user_details');
    if (storedUserDetails && storedUserDetails !== 'undefined' && storedUserDetails !== null) {
      setUserDetails(JSON.parse(storedUserDetails));
    } else {
      // Fetch user details if not in local storage
      const formData = new FormData();
      formData.append('action', 'get-profile');
      fetcher.submit(formData, { method: 'post', action: '/auth' });
    }

    // Check Local Storage for user links
    const storedUserLinks = localStorage.getItem('user_links');
    if (storedUserLinks && storedUserLinks !== 'undefined' && storedUserLinks !== null) {
      setUserLinks(JSON.parse(storedUserLinks));
    } else {
      // Fetch user links if not in local storage
      const formData = new FormData();
      formData.append('action', 'get-links');
      fetcher.submit(formData, { method: 'post', action: '/auth' });
    }
  }, []);

  useEffect(() => {
    // Handle fetcher data for user details
    if (fetcher.data?.profile) {
      setUserDetails(fetcher.data.profile);
      localStorage.setItem('user_details', JSON.stringify(fetcher.data.profile));
    }

    // Handle fetcher data for user links
    if (fetcher.data?.links) {
      setUserLinks(fetcher.data.links);
      localStorage.setItem('user_links', JSON.stringify(fetcher.data.links));
    }
  }, [fetcher.data, setUserLinks, setUserDetails]);

  const renderLinksContent = () => {
    if (userLinks.length === 0) {
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
          <img src={userDetails?.url?.publicUrl} alt="dashboard preview" />
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
