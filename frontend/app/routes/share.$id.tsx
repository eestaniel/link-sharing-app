import styles from "../styles/Dashboard.Preview.module.css";
import {LoaderFunction} from "@remix-run/node"
import {linkMenuList, LinkMenuStyles} from "~/components/links_menu/LinkMenu"
import {LinkMenuIcons} from "~/components/links_menu/LinkMenuIcons"
import {RightArrowIcon} from "~/assets/svgs/IconSVGs"
import {useLoaderData} from "@remix-run/react"
import {Key} from "react";
import {useLocation} from "react-router";

export const loader: LoaderFunction = async ({request, params}) => {

  const id: string | undefined = params.id
  const baseUrl = process.env.BASE_URL
  const response = await fetch(`${baseUrl}/api/share/get-share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({id: id}),
  })

  const {profile, links, error} = await response.json()

  return {profile, links}
}
const PublicShareId = () => {

  const renderLinksContent = () => {
    if (links.length == 0) {
      return ;
    } else {
      return (
        links.map((link: {
          platform: string, url: string
        }, index: Key | null | undefined) => (
          <a
            key={index}
            href={link.url}
            className={`${styles.button_container} ${LinkMenuStyles(link.platform)}`}>
            <div
              className={`${styles.icon_label_group} ${LinkMenuStyles(link.platform)}`}>
              <div className={`${styles.svg_container} `}>
                {LinkMenuIcons[link.platform as keyof typeof LinkMenuIcons]}
              </div>
              {linkMenuList[link.platform as keyof typeof linkMenuList]}
            </div>
            <div
              className={`${styles.right_arrow_container} `}>
              <RightArrowIcon/>
            </div>
          </a>
        ))
      );
    }
  };

  const {profile, links} = useLoaderData() as any;
  const location = useLocation();
  const path = location.pathname;
  return (
    <>
      <div className={styles.background}></div>
      <div className={`${styles.preview_container} ${path.split('/')[1] === 'share' && styles.share}`}>
        <section className={styles.picture_header_container}>
          <div className={styles.picture_container}>
            <img src={profile?.url} alt=""/>
          </div>
          <header className={styles.header_group}>
            <h1>{profile?.first_name} {profile?.last_name}</h1>
            <p>{profile?.email}</p>
          </header>
        </section>
        <section className={styles.links_container}>
          {renderLinksContent()}
        </section>
      </div>
    </>
  );
};

export default PublicShareId;