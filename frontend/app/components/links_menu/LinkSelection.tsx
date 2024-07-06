import styles from "./LinkSelection.module.css"
import {useLinksStore} from "~/store/LinksStore";
import Dropdown from "./dropdown/Dropdown";

const LinkSelection = () => {
  const {userLinks} = useLinksStore(state => ({
    userLinks: state.userLinks,
  }));



  return (
      <div className={styles.link_selection_container}>
        {userLinks.map((object, index) => (
            <Dropdown key={index} index={index} platform={object.platform} link={object.url} id={object.id}/>
        ))}
      </div>
  );
};

export default LinkSelection