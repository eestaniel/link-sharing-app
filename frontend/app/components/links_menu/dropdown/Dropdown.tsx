import styles from "./Dropdown.module.css"
import {useState, useMemo, useCallback, useEffect} from "react";
import {linkMenuList} from '../LinkMenu'
import {LinkMenuIcons} from "../LinkMenuIcons";
import {LinkKey} from "../LinkMenu";
import {useLinksStore} from "~/store/LinksStore";

interface DropdownProps {
  id: string;
  index: number;
  platform: string;
  link: string;
}

const Dropdown = ({ id, platform, link, index }: DropdownProps) => {
  const [linkValue, setLinkValue] = useState(link);
  const { removeLink, editLinkUrl } = useLinksStore((state) => ({
    removeLink: state.removeLink,
    editLinkUrl: state.editLinkUrl,
  }));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Handle dropdown toggle
  const handleOpenDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Handle link removal
  const handleRemoveLink = useCallback(() => {
    removeLink(id);
  }, [id, removeLink]);

  // Handle link change
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setLinkValue(newUrl);
    editLinkUrl(id, newUrl);
  };

  // Sync local state with global state on prop change
  useEffect(() => {
    setLinkValue(link);
  }, [link]);
  return (
      <form className={styles.form_container}>
        <div className={styles.header_group}>
          <div className={styles.drag_group}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="6" fill="none" viewBox="0 0 12 6">
              <path fill="#737373" d="M0 0h12v1H0zM0 5h12v1H0z"/>
            </svg>
            <p className={styles.drag_p}>Link #{index + 1}</p>
          </div>
          <p className={styles.remove_text} onClick={handleRemoveLink}>Remove</p>
        </div>

        <div className={styles.form_group}>
          <p className={styles.form_label}>Platform</p>
          <div className={styles.form_container} onClick={handleOpenDropdown}>
            <div className={styles.icon_img_group}>
              {LinkMenuIcons[platform as LinkKey]}
              {linkMenuList[platform as LinkKey]}
            </div>
            <div className={`${styles.cheveron_container} ${isDropdownOpen ? styles.is_open : styles.is_closed}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="9" fill="none" viewBox="0 0 14 9">
                <path stroke="#633CFF" strokeWidth="2" d="m1 1 6 6 6-6"/>
              </svg>
            </div>

          </div>
        </div>

        <div className={styles.form_group}>
          <p className={styles.form_label}>Link</p>
          <div className={styles.input_container}>
            <input type="text" value={linkValue} className={styles.form_container} onChange={handleLinkChange}/>
            <div className={styles.svg_container}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path fill="#737373"
                      d="M8.523 11.72a.749.749 0 0 1 0 1.063l-.371.371A3.751 3.751 0 1 1 2.847 7.85l1.507-1.506A3.75 3.75 0 0 1 9.5 6.188a.753.753 0 0 1-1 1.125 2.25 2.25 0 0 0-3.086.091L3.908 8.91a2.25 2.25 0 0 0 3.183 3.183l.37-.371a.748.748 0 0 1 1.062 0Zm4.63-8.874a3.756 3.756 0 0 0-5.305 0l-.371.37A.751.751 0 1 0 8.539 4.28l.372-.37a2.25 2.25 0 0 1 3.182 3.182l-1.507 1.507a2.25 2.25 0 0 1-3.086.09.753.753 0 0 0-1 1.125 3.75 3.75 0 0 0 5.144-.152l1.507-1.507a3.756 3.756 0 0 0 .002-5.307v-.001Z"/>
              </svg>
            </div>
          </div>

        </div>
      </form>
  );
};

export default Dropdown;