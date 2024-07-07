import styles from "./Dropdown.module.css"
import {useState, useCallback, useEffect} from "react";
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
      <></>
  );
};

export default Dropdown;