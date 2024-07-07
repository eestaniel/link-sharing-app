import styles from "./Dropdown.module.css"
import {linkMenuList} from '../LinkMenu'
import {LinkMenuIcons} from "../LinkMenuIcons";
import {LinkKey} from "../LinkMenu";
import {useEffect} from "react"


interface DropdownProps {
  handleItemSelection: (key: LinkKey) => void;

}


const Dropdown = ({handleItemSelection}: DropdownProps) => {


  return (
    <div className={styles.link_menu_list_container}>
      {Object.entries(linkMenuList).map(([key, label]) => (
        <div className={styles.link_menu_item}
             key={key}
             onClick={() => handleItemSelection(key as LinkKey)}
        >
          {LinkMenuIcons[key as LinkKey] || <span>No icon available</span>}
          <span>{label}</span>
        </div>
      ))}

    </div>
  )
};

export default Dropdown;