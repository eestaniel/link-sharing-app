import styles from "../styles/Dashboard.Preview.module.css";
import {useLinksStore} from "~/store/LinksStore";
import {linkMenuList, LinkMenuStyles} from "~/components/links_menu/LinkMenu";
import {LinkMenuIcons} from "~/components/links_menu/LinkMenuIcons";
import {RightArrowIcon} from "~/assets/svgs/IconSVGs";
import {LoaderFunction} from "@remix-run/node";
import {useEffect} from "react";
import {validateCookieSession} from "~/utils/cookie-utils"


export const loader: LoaderFunction = async ({request}) => {
  const response = await validateCookieSession(request, '/dashboard');
  if (response) {
    return response
  }

  return {}
};

const DashboardPreview = () => {
  const {
    dbUserDetails,
    dbLinks,
    setDbUserLinks,
    setDbUserDetails,
    userLinks,
  } = useLinksStore((state) => ({
    dbUserDetails: state.dbUserDetails,
    dbLinks: state.dbLinks,
    setDbUserLinks: state.setDbUserLinks,
    setDbUserDetails: state.setDbUserDetails,
    userLinks: state.userLinks,
  }));

  useEffect(() => {
    if ( dbLinks && dbUserDetails) {
      setDbUserLinks(dbLinks);
      setDbUserDetails(dbUserDetails);
    }
  }, [dbLinks, dbUserDetails]);

  const renderLinksContent = () => {
    if (userLinks.length === 0) {
      return null;
    } else {
      return (
        userLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button_container} ${LinkMenuStyles(link.platform)}`}
          >
            <div
              className={`${styles.icon_label_group} ${LinkMenuStyles(link.platform)}`}
            >
              <div className={`${styles.svg_container}`}>
                {LinkMenuIcons[link.platform as keyof typeof LinkMenuIcons]}
              </div>
              {linkMenuList[link.platform as keyof typeof linkMenuList]}
            </div>
            <div
              className={`${styles.right_arrow_container}`}
            >
              <RightArrowIcon />
            </div>
          </a>
        ))
      );
    }
  };

  return (
    <>
      <div className={styles.background}></div>
      <div className={styles.preview_container}>

        <section className={styles.picture_header_container}>
          <div className={styles.picture_container}>
            <img src={dbUserDetails?.url} alt=""/>
          </div>
          <header className={styles.header_group}>
            <h1>{dbUserDetails?.first_name} {dbUserDetails?.last_name}</h1>
            <p>{dbUserDetails?.email}</p>
          </header>
        </section>
        <section className={styles.links_container}>
          {renderLinksContent()}
        </section>
      </div>

    </>
  );
};

export default DashboardPreview;
