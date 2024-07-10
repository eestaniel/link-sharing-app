import styles from "../styles/Dashboard.Preview.module.css";
import {LoaderFunction} from "@remix-run/node"
import {linkMenuList, LinkMenuStyles} from "~/components/links_menu/LinkMenu"
import {LinkMenuIcons} from "~/components/links_menu/LinkMenuIcons"
import {RightArrowIcon} from "~/assets/svgs/IconSVGs"
import {useLoaderData} from "@remix-run/react"
import { Key } from "react";


export const loader: LoaderFunction = async ({request, params}) => {

  const id: string | undefined = params.id

  const response = await fetch(`http://localhost:3000/api/share/get-share`, {
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
      return (
        <div className={styles.empty_links_container}>
          <p>No links added yet</p>
        </div>
      );
    } else {
      return (
        links.map((link: { platform: string; }, index: Key | null | undefined) => (
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

  const {profile, links} = useLoaderData() as any;

 return (
   <div className={styles.preview_container}>
     <section className={styles.picture_header_container}>
       <div className={styles.picture_container}>
         <img src={profile?.url} alt="profile img"/>
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
 );
};

export default PublicShareId;