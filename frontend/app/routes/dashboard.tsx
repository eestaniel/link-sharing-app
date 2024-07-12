import React, {useEffect, useMemo, useState} from 'react';
import {Outlet, useLocation} from "@remix-run/react";
import {json, redirect} from "@remix-run/node";
import Navigation from "~/components/navigation/Navigation";
import styles from '../styles/Dashboard.module.css';
import {sessionCookie} from "~/utils/sessionCookie";
import {useLinksStore} from "~/store/LinksStore";
import {useDragAndDrop} from "@formkit/drag-and-drop/react";
import {getData} from "~/services/user-services";
import {linkMenuList, LinkMenuStyles} from '~/components/links_menu/LinkMenu';
import {LinkMenuIcons} from "~/components/links_menu/LinkMenuIcons"
import {RightArrowIcon} from "~/assets/svgs/IconSVGs"
import {Toast} from "~/components/toast/Toast"


export const action = async ({request}: any) => {
  const formData = await request.formData();
  const page = formData.get('page') as string;
  const actionType = formData.get('action') as string;

  if (page) {
    switch (page) {
      case 'edit-links':
      case '/dashboard/links':
        return redirect('/dashboard/links');
      case 'edit-profile':
      case '/dashboard/profile':
        return redirect('/dashboard/profile');
      case 'preview-links':
        return redirect('/dashboard/preview');
      default:
        return redirect('/dashboard/links');
    }
  }

  if (actionType) {
    switch (actionType) {
      case 'logout':
        return redirect('/logout');
      case 'save-links':
        return await saveLinks(formData, request);
      default:
        return redirect('/dashboard/links');
    }
  }
};

const saveLinks = async (formData: any, request: any) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    return redirect("/");
  }

  const baseURL = process.env.BASE_URL;
  const response = await fetch(`${baseURL}/api/users/save-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      links: JSON.parse(formData.get('links') as string),
    }),
  });

  const responseBody = await response.json();
  if (responseBody.error) {
    return {error: responseBody.error};
  }

  return {message: responseBody};
};

export const loader = async ({request}: any) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = await sessionCookie.parse(cookieHeader);
  const accessToken = session?.accessToken ?? null;

  if (!accessToken) {
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }

  const {links, profile, error} = await getData(accessToken);
  if (error) {
    return redirect("/", {
      headers: {"Set-Cookie": await sessionCookie.serialize("", {maxAge: 0})}
    });
  }
  return json({links, profile});
};

const Dashboard = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const handleResize = () => {
    if (window.innerWidth >= 1024) {
      setIsDesktop(true);
    } else {
      setIsDesktop(false);
    }
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    userLinks,
    userDetails,
    setUserLinks,
    showToast,
    setShowToast,
    toastMessage,
  } = useLinksStore(state => ({
    userLinks: state.userLinks,
    userDetails: state.userDetails,
    setUserLinks: state.setUserLinks,
    showToast: state.showToast,
    setShowToast: state.setShowToast,
    toastMessage: state.toastMessage,
  }));

  const location = useLocation();

  const [parent, previewLinks, setPreviewLinks] = useDragAndDrop(
    userLinks,
    {
      group: 'links',
      sortable: true,

    }
  )

  useEffect(() => {
    if (userLinks && userLinks.length > 0) {
      setPreviewLinks(userLinks);
    } else if (userLinks) {
      setPreviewLinks(userLinks);
    }
  }, [userLinks]);

  useEffect(() => {
    if (previewLinks && previewLinks.length > 0) {

      setUserLinks(previewLinks);
    }

  }, [previewLinks]);

  const handleDismissToast = () => {
    setShowToast(false);
  };

  const renderLinksPreviewComponent = useMemo(() => {
    return (
      <section className={styles.links_preview_container}>
        <div className={styles.preview_section}>
          <div className={styles.preview_group}>
            <div className={styles.header_group}>
              {userDetails?.url ?
                <img src={userDetails?.url} alt=""/> :
                <div className={styles.empty_image}></div>
              }

              <div
                className={`${styles.profile_details_group} ${userDetails?.first_name && userDetails?.email && styles.fill_bg_group}`}>
                {userDetails?.first_name && userDetails?.last_name &&
                  <h2>{userDetails?.first_name} {userDetails?.last_name}</h2>}
                <p>{userDetails?.email}</p>
              </div>
            </div>
            <div className={styles.links_group}>
              <ul ref={parent}>
                {previewLinks?.map((link) => (
                  <li key={link.id}>
                    <div
                      className={`${styles.icon_platform_group} ${LinkMenuStyles(link.platform)}`}
                    >
                      <div className={styles.group1}>
                        {LinkMenuIcons[link.platform]}
                        {linkMenuList[link.platform]}
                      </div>
                      {<RightArrowIcon/>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }, [previewLinks, userDetails]);

  return (
    <div
      className={`${styles.page_container} 
      ${location.pathname !== '/dashboard/preview' && styles.center_page}}
      ${location.pathname === '/dashboard/preview' && styles.prev_page}`}
    >
      <Navigation/>
      <div
        className={`${styles.dashboard_container} ${location.pathname === '/dashboard/preview' && styles.preview_page}`}>
        <div className={styles.wrapper}>
          {location.pathname !== '/dashboard/preview' && isDesktop && renderLinksPreviewComponent}
          <Outlet/>
          {showToast &&
            <Toast message={toastMessage}
                   onDismiss={handleDismissToast}/>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
