import styles from "./Dropdown.module.css";
import { LinkKey, linkMenuList } from "../LinkMenu";
import { LinkMenuIcons } from "../LinkMenuIcons";
import { useEffect, useRef } from "react";

interface DropdownProps {
  handleItemSelection: (key: LinkKey) => void;
  handleClose: () => void; // Add a prop for handling the close action
}

const Dropdown = ({ handleItemSelection, handleClose }: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const ScrollToView = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);
    return <div ref={scrollRef} />;
  };

  return (
    <>
      <ScrollToView />
      <div className={styles.link_menu_list_container} ref={dropdownRef}>
        {Object.entries(linkMenuList).map(([key, label]) => (
          <div
            className={styles.link_menu_item}
            role={"presentation"}
            key={key}
            onClick={() => handleItemSelection(key as LinkKey)}
          >
            {LinkMenuIcons[key as LinkKey] || <span>No icon available</span>}
            <span>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Dropdown;
